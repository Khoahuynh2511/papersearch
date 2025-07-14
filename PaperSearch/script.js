/**
 * Scientific Paper Search Tool
 * A comprehensive web application for searching academic papers from multiple sources
 * @author Paper Search Tool Team
 * @version 1.0.0
 */

// ===== GLOBAL CONFIGURATION =====
const CONFIG = {
    // API Endpoints
    APIS: {
        ARXIV: 'https://export.arxiv.org/api/query',
        CROSSREF: 'https://api.crossref.org/works',
        SEMANTIC_SCHOLAR: 'https://api.semanticscholar.org/graph/v1',
        OPENALEX: 'https://api.openalex.org',
        PUBMED: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
        ORCID: 'https://pub.orcid.org/v3.0',
        OPENCITATIONS: 'https://opencitations.net/index/api/v1',
        DOAJ: 'https://doaj.org/api/search'
    },
    
    // CORS Proxy (you can replace with your own or use a free service)
    CORS_PROXY: 'https://api.allorigins.win/raw?url=',
    
    // Search configuration
    SEARCH: {
        DEBOUNCE_DELAY: 300,
        DEFAULT_PER_PAGE: 20,
        DISPLAY_PER_PAGE: 10, // Always display 10 papers per page
        MAX_RESULTS: 5000,
        MAX_PER_API_CALL: 200, // Maximum results per single API call
        CACHE_DURATION: 300000, // 5 minutes
        RATE_LIMITS: {
            SEMANTIC_SCHOLAR: 100, // requests per second
            OPENALEX: 10, // requests per second
            PUBMED: 3, // requests per second
            ORCID: 24, // requests per second
            OPENCITATIONS: 5, // requests per second
            DOAJ: 2 // requests per second
        }
    },
    
    // UI configuration
    UI: {
        ANIMATION_DURATION: 300,
        SKELETON_COUNT: 5,
        MOBILE_BREAKPOINT: 768
    },
    
    // Storage keys
    STORAGE_KEYS: {
        BOOKMARKS: 'paper_search_bookmarks',
        RECENT_SEARCHES: 'paper_search_recent',
        THEME: 'paper_search_theme',
        FILTERS: 'paper_search_filters'
    }
};

// ===== UTILITY FUNCTIONS =====
class Utils {
    /**
     * Debounce function calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Format date string
     */
    static formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return 'Unknown date';
        }
    }

    /**
     * Truncate text with ellipsis
     */
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Deep clone object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Check if device is mobile
     */
    static isMobile() {
        return window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;
    }

    /**
     * Scroll to element smoothly
     */
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Show notification (simple implementation)
     */
    static showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            transform: translateX(400px);
            transition: transform 0.3s ease-out;
        `;
        
        if (type === 'error') {
            notification.style.background = 'var(--error-color)';
        } else if (type === 'success') {
            notification.style.background = 'var(--success-color)';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ===== PAPER SEARCH ENGINE =====
class PaperSearchEngine {
    constructor() {
        this.cache = new Map();
        this.currentResults = [];
        this.currentQuery = '';
        this.currentFilters = {};
        this.totalResults = 0;
        this.isSearching = false;
        
        // Initialize search history
        this.searchHistory = this.loadSearchHistory();
        
        // Bind methods
        this.searchAll = this.searchAll.bind(this);
        this.searchArxiv = this.searchArxiv.bind(this);
        this.searchCrossRef = this.searchCrossRef.bind(this);
        this.searchCORE = this.searchCORE.bind(this);
        this.searchSemanticScholar = this.searchSemanticScholar.bind(this);
        this.searchOpenAlex = this.searchOpenAlex.bind(this);
        this.searchPubMed = this.searchPubMed.bind(this);
        this.searchDOAJ = this.searchDOAJ.bind(this);
        
        // Data enrichment methods
        this.enrichWithCitations = this.enrichWithCitations.bind(this);
        this.enrichWithAuthorInfo = this.enrichWithAuthorInfo.bind(this);
        this.enrichWithMetrics = this.enrichWithMetrics.bind(this);
    }

    /**
     * Main search function that searches all sources
     */
    async searchAll(query, filters = {}) {
        if (this.isSearching) {
            console.log('Search already in progress');
            return [];
        }

        this.isSearching = true;
        this.currentQuery = query;
        this.currentFilters = filters;

        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(query, filters);
            if (this.cache.has(cacheKey)) {
                const cachedData = this.cache.get(cacheKey);
                if (Date.now() - cachedData.timestamp < CONFIG.SEARCH.CACHE_DURATION) {
                    this.currentResults = cachedData.results;
                    this.totalResults = cachedData.total;
                    this.isSearching = false;
                    return this.currentResults;
                }
            }

            // Add to search history
            this.addToSearchHistory(query);

            // Determine which sources to search (CORE API removed)
            const source = filters.source || 'all';
            const promises = [];

            if (source === 'all' || source === 'arxiv') {
                promises.push(this.searchArxiv(query, filters));
            }
            if (source === 'all' || source === 'crossref') {
                promises.push(this.searchCrossRef(query, filters));
            }
            if (source === 'all' || source === 'semantic_scholar') {
                promises.push(this.searchSemanticScholar(query, filters));
            }
            if (source === 'all' || source === 'openalex') {
                promises.push(this.searchOpenAlex(query, filters));
            }
            if (source === 'all' || source === 'pubmed') {
                promises.push(this.searchPubMed(query, filters));
            }
            if (source === 'all' || source === 'doaj') {
                promises.push(this.searchDOAJ(query, filters));
            }

            // Execute searches in parallel with rate limiting
            const results = await Promise.allSettled(promises);
            
            // Combine and process results
            let allResults = [];
            let successfulSearches = 0;
            let failedSearches = 0;
            
            results.forEach((result, index) => {
                const sources = ['ArXiv', 'CrossRef', 'Semantic Scholar', 'OpenAlex', 'PubMed', 'DOAJ'];
                const sourceName = sources[index] || `Source ${index}`;
                
                if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                    allResults = allResults.concat(result.value);
                    successfulSearches++;
                    console.log(`✅ ${sourceName}: ${result.value.length} results`);
                } else if (result.status === 'fulfilled' && result.value && result.value.length === 0) {
                    successfulSearches++; // API worked but no results found
                    console.log(`ℹ️ ${sourceName}: No results found`);
                } else {
                    failedSearches++;
                    console.warn(`❌ ${sourceName} failed:`, result.reason);
                    
                    // Show user-friendly error for specific APIs
                    if (index === 2 && result.reason?.message?.includes('rate limit')) {
                        Utils.showNotification('Semantic Scholar rate limit reached. Try again in a moment.', 'warning');
                    } else if (index === 4 && result.reason?.message?.includes('PubMed')) {
                        Utils.showNotification('PubMed temporarily unavailable. Other sources still searched.', 'warning');
                    }
                }
            });
            
            // Show summary of search results
            if (successfulSearches > 0) {
                console.log(`🎯 Search summary: ${successfulSearches}/${results.length} sources successful, ${allResults.length} total results`);
            }

            // Check if any API worked
            if (successfulSearches === 0) {
                throw new Error('All search APIs are currently unavailable. Please try again later.');
            }

            // Show notification about API status
            if (successfulSearches < promises.length) {
                const workingAPIs = [];
                if (source === 'all' || source === 'arxiv') workingAPIs.push('ArXiv');
                if (source === 'all' || source === 'crossref') workingAPIs.push('CrossRef');
                console.log(`Search completed using ${successfulSearches} out of ${promises.length} APIs`);
            }

            // Merge and deduplicate results
            const processedResults = this.mergeAndDeduplicate(allResults);
            
            // Apply additional filters and sorting
            const filteredResults = this.applyFilters(processedResults, filters);
            const sortedResults = this.sortResults(filteredResults, filters.sort || 'relevance');

            // Cache results
            this.cache.set(cacheKey, {
                results: sortedResults,
                total: sortedResults.length,
                timestamp: Date.now()
            });

            this.currentResults = sortedResults;
            this.totalResults = sortedResults.length;
            this.isSearching = false;

            return sortedResults;

        } catch (error) {
            console.error('Search error:', error);
            this.isSearching = false;
            throw error;
        }
    }

    /**
     * Search ArXiv database
     */
    async searchArxiv(query, filters = {}) {
        try {
            // Build ArXiv query
            let arxivQuery = this.buildArxivQuery(query, filters);
            let maxResults = filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE;
            // For large requests, increase max_results per API call
            if (maxResults > 50) {
                maxResults = Math.min(maxResults, 1000); // ArXiv allows up to ~2000 but 1000 is safer
            }
            const start = ((filters.page || 1) - 1) * maxResults;

            const url = `${CONFIG.APIS.ARXIV}?search_query=${encodeURIComponent(arxivQuery)}&start=${start}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

            console.log('ArXiv search URL:', url);
            console.log('🔍 Searching ArXiv...');

            // Try direct fetch first, then fallback to CORS proxy
            let response;
            try {
                response = await fetch(url);
                console.log('ArXiv direct fetch successful');A
            } catch (error) {
                console.log('Direct fetch failed, trying CORS proxy...');
                response = await fetch(CONFIG.CORS_PROXY + encodeURIComponent(url));
                console.log('ArXiv CORS proxy successful');
            }
            
            if (!response.ok) {
                throw new Error(`ArXiv API error: ${response.status}`);
            }

            const xmlText = await response.text();
            const results = this.parseArxivResponse(xmlText);
            console.log(`ArXiv returned ${results.length} papers`);
            return results;

        } catch (error) {
            console.error('ArXiv search error:', error);
            // Return empty array instead of throwing to allow other APIs to work
            console.warn('ArXiv search failed, continuing with other sources');
            return [];
        }
    }

    /**
     * Search CrossRef database
     */
    async searchCrossRef(query, filters = {}) {
        try {
            let maxResults = filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE;
            // For large requests, increase rows per API call
            if (maxResults > 50) {
                maxResults = Math.min(maxResults, 1000); // CrossRef allows up to 1000 per request
            }
            const offset = ((filters.page || 1) - 1) * maxResults;

            let url = `${CONFIG.APIS.CROSSREF}?query=${encodeURIComponent(query)}&rows=${maxResults}&offset=${offset}`;

            // Add filters
            if (filters.yearFrom || filters.yearTo) {
                const fromYear = filters.yearFrom || '1900';
                const toYear = filters.yearTo || new Date().getFullYear();
                url += `&filter=from-pub-date:${fromYear},until-pub-date:${toYear}`;
            }

            if (filters.author) {
                url += `&query.author=${encodeURIComponent(filters.author)}`;
            }

            console.log('CrossRef search URL:', url);
            console.log('Searching CrossRef...');

            // Use CORS proxy for CrossRef with timeout
            const proxyUrl = CONFIG.CORS_PROXY + encodeURIComponent(url);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            clearTimeout(timeoutId);
            console.log('CrossRef fetch successful');
            
            if (!response.ok) {
                throw new Error(`CrossRef API error: ${response.status}`);
            }

            const data = await response.json();
            const results = this.parseCrossRefResponse(data);
            console.log(`CrossRef returned ${results.length} papers`);
            return results;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('CrossRef search timeout after 10 seconds');
            } else {
                console.error('CrossRef search error:', error);
            }
            // Return empty array instead of throwing to allow other APIs to work
            console.warn('CrossRef search failed, continuing with other sources');
            return [];
        }
    }

    /**
     * Search CORE database
     */
    async searchCORE(query, filters = {}, apiKey = null) {
        try {
            // Get API key from storage or parameter
            const coreApiKey = apiKey || localStorage.getItem(CONFIG.STORAGE_KEYS.CORE_API_KEY);
            
            if (!coreApiKey) {
                console.warn('CORE API key not provided, skipping CORE search');
                return [];
            }

            const limit = filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE;
            const offset = ((filters.page || 1) - 1) * limit;

            const url = `${CONFIG.APIS.CORE}?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;

            console.log('CORE search URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${coreApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid CORE API key');
                }
                throw new Error(`CORE API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseCOREResponse(data);

        } catch (error) {
            console.error('CORE search error:', error);
            throw new Error(`CORE search failed: ${error.message}`);
        }
    }

    /**
     * Search Semantic Scholar database
     */
    async searchSemanticScholar(query, filters = {}) {
        try {
            const limit = Math.min(filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE, 100);
            const offset = ((filters.page || 1) - 1) * limit;
            
            const fields = 'title,abstract,authors,year,citationCount,influentialCitationCount,venue,url,openAccessPdf,externalIds';
            const url = `${CONFIG.APIS.SEMANTIC_SCHOLAR}/paper/search`;
            
            const params = new URLSearchParams({
                query: query,
                limit: limit,
                offset: offset,
                fields: fields
            });

            console.log('Semantic Scholar search URL:', `${url}?${params}`);

            const response = await fetch(`${url}?${params}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Semantic Scholar API error: ${response.status}`);
            }

            const data = await response.json();
            const results = this.parseSemanticScholarResponse(data);
            console.log(`Semantic Scholar returned ${results.length} papers`);
            return results;

        } catch (error) {
            console.error('Semantic Scholar search error:', error);
            return [];
        }
    }

    /**
     * Search OpenAlex database
     */
    async searchOpenAlex(query, filters = {}) {
        try {
            const perPage = Math.min(filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE, 200);
            const page = filters.page || 1;
            
            const url = `${CONFIG.APIS.OPENALEX}/works`;
            const params = new URLSearchParams({
                search: query,
                'per-page': perPage,
                page: page,
                sort: 'relevance_score:desc'
            });

            if (filters.yearFrom || filters.yearTo) {
                const fromYear = filters.yearFrom || 1900;
                const toYear = filters.yearTo || new Date().getFullYear();
                params.append('filter', `publication_year:${fromYear}-${toYear}`);
            }

            console.log('OpenAlex search URL:', `${url}?${params}`);

            const response = await fetch(`${url}?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'PaperSearchTool/1.0 (mailto:your-email@example.com)'
                }
            });

            if (!response.ok) {
                throw new Error(`OpenAlex API error: ${response.status}`);
            }

            const data = await response.json();
            const results = this.parseOpenAlexResponse(data);
            console.log(`OpenAlex returned ${results.length} papers`);
            return results;

        } catch (error) {
            console.error('OpenAlex search error:', error);
            return [];
        }
    }

    /**
     * Search PubMed database
     */
    async searchPubMed(query, filters = {}) {
        try {
            const retmax = Math.min(filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE, 200);
            const retstart = ((filters.page || 1) - 1) * retmax;
            
            // First, search for PMIDs
            const searchUrl = `${CONFIG.APIS.PUBMED}/esearch.fcgi`;
            const searchParams = new URLSearchParams({
                db: 'pubmed',
                term: query,
                retmax: retmax,
                retstart: retstart,
                retmode: 'json',
                sort: 'relevance'
            });

            console.log('PubMed search URL:', `${searchUrl}?${searchParams}`);

            const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
            if (!searchResponse.ok) {
                throw new Error(`PubMed search API error: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();
            const pmids = searchData.esearchresult.idlist;

            if (!pmids || pmids.length === 0) {
                return [];
            }

            // Then fetch details for found PMIDs
            const fetchUrl = `${CONFIG.APIS.PUBMED}/efetch.fcgi`;
            const fetchParams = new URLSearchParams({
                db: 'pubmed',
                id: pmids.join(','),
                retmode: 'xml'
            });

            const fetchResponse = await fetch(`${fetchUrl}?${fetchParams}`);
            if (!fetchResponse.ok) {
                throw new Error(`PubMed fetch API error: ${fetchResponse.status}`);
            }

            const xmlText = await fetchResponse.text();
            const results = this.parsePubMedResponse(xmlText);
            console.log(`PubMed returned ${results.length} papers`);
            return results;

        } catch (error) {
            console.error('PubMed search error:', error);
            return [];
        }
    }

    /**
     * Search DOAJ database
     */
    async searchDOAJ(query, filters = {}) {
        try {
            const pageSize = Math.min(filters.perPage || CONFIG.SEARCH.DEFAULT_PER_PAGE, 100);
            const page = filters.page || 1;
            
            const url = `${CONFIG.APIS.DOAJ}/articles`;
            const params = new URLSearchParams({
                q: query,
                pageSize: pageSize,
                page: page,
                sort: 'relevance'
            });

            console.log('DOAJ search URL:', `${url}?${params}`);

            const response = await fetch(`${url}?${params}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`DOAJ API error: ${response.status}`);
            }

            const data = await response.json();
            const results = this.parseDOAJResponse(data);
            console.log(`DOAJ returned ${results.length} papers`);
            return results;

        } catch (error) {
            console.error('DOAJ search error:', error);
            return [];
        }
    }

    /**
     * Build ArXiv query string
     */
    buildArxivQuery(query, filters) {
        let arxivQuery = query;

        if (filters.author) {
            arxivQuery += ` AND au:"${filters.author}"`;
        }

        if (filters.category) {
            const categoryMap = {
                'cs': 'cat:cs.*',
                'math': 'cat:math.*',
                'physics': 'cat:physics.*',
                'bio': 'cat:q-bio.*',
                'econ': 'cat:econ.*',
                'stat': 'cat:stat.*'
            };
            if (categoryMap[filters.category]) {
                arxivQuery += ` AND ${categoryMap[filters.category]}`;
            }
        }

        if (filters.exactPhrase) {
            arxivQuery = `"${query}"`;
        }

        return arxivQuery;
    }

    /**
     * Parse ArXiv XML response
     */
    parseArxivResponse(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('Failed to parse ArXiv response');
        }

        const entries = xmlDoc.querySelectorAll('entry');
        const papers = [];

        entries.forEach(entry => {
            try {
                const id = entry.querySelector('id')?.textContent || '';
                const arxivId = id.split('/').pop();
                
                const title = entry.querySelector('title')?.textContent?.trim() || 'No title';
                const summary = entry.querySelector('summary')?.textContent?.trim() || 'No abstract available';
                const published = entry.querySelector('published')?.textContent || '';
                
                // Parse authors
                const authors = Array.from(entry.querySelectorAll('author name')).map(
                    author => author.textContent.trim()
                );
                
                // Parse categories
                const categories = Array.from(entry.querySelectorAll('category')).map(
                    cat => cat.getAttribute('term')
                );
                
                // Get PDF link
                const pdfLink = Array.from(entry.querySelectorAll('link')).find(
                    link => link.getAttribute('type') === 'application/pdf'
                )?.getAttribute('href') || '';

                papers.push({
                    id: `arxiv_${arxivId}`,
                    title: title,
                    authors: authors,
                    abstract: summary,
                    publishedDate: published.split('T')[0],
                    source: 'ArXiv',
                    url: id,
                    doi: null,
                    citationCount: null,
                    categories: categories,
                    journal: 'ArXiv',
                    downloadUrl: pdfLink,
                    arxivId: arxivId
                });
            } catch (error) {
                console.warn('Error parsing ArXiv entry:', error);
            }
        });

        return papers;
    }

    /**
     * Parse CrossRef JSON response
     */
    parseCrossRefResponse(data) {
        if (!data.message || !data.message.items) {
            return [];
        }

        const papers = [];

        data.message.items.forEach(item => {
            try {
                const title = item.title?.[0] || 'No title';
                const authors = item.author?.map(author => 
                    `${author.given || ''} ${author.family || ''}`.trim()
                ) || [];
                
                const abstract = item.abstract || 'No abstract available';
                const publishedDate = item['published-print']?.['date-parts']?.[0] || 
                                    item['published-online']?.['date-parts']?.[0] || [];
                
                const formattedDate = publishedDate.length >= 3 ? 
                    `${publishedDate[0]}-${String(publishedDate[1]).padStart(2, '0')}-${String(publishedDate[2]).padStart(2, '0')}` :
                    publishedDate.length >= 1 ? `${publishedDate[0]}` : '';

                const journal = item['container-title']?.[0] || 'Unknown journal';
                const doi = item.DOI || '';
                const url = doi ? `https://doi.org/${doi}` : '';
                const citationCount = item['is-referenced-by-count'] || 0;

                papers.push({
                    id: `crossref_${doi || Utils.generateId()}`,
                    title: title,
                    authors: authors,
                    abstract: abstract,
                    publishedDate: formattedDate,
                    source: 'CrossRef',
                    url: url,
                    doi: doi,
                    citationCount: citationCount,
                    categories: item.subject || [],
                    journal: journal,
                    downloadUrl: null
                });
            } catch (error) {
                console.warn('Error parsing CrossRef entry:', error);
            }
        });

        return papers;
    }

    /**
     * Parse CORE JSON response
     */
    parseCOREResponse(data) {
        if (!data.results) {
            return [];
        }

        const papers = [];

        data.results.forEach(item => {
            try {
                const title = item.title || 'No title';
                const authors = item.authors?.map(author => 
                    typeof author === 'string' ? author : author.name || ''
                ).filter(name => name) || [];
                
                const abstract = item.abstract || item.description || 'No abstract available';
                const publishedDate = item.publishedDate || item.yearPublished || '';
                const journal = item.journals?.[0]?.title || item.publisher || 'Unknown journal';
                const downloadUrl = item.downloadUrl || item.fullTextPdf || null;

                papers.push({
                    id: `core_${item.id || Utils.generateId()}`,
                    title: title,
                    authors: authors,
                    abstract: abstract,
                    publishedDate: publishedDate,
                    source: 'CORE',
                    url: item.urls?.[0] || downloadUrl || '',
                    doi: item.doi || null,
                    citationCount: item.citationCount || null,
                    categories: item.subjects || [],
                    journal: journal,
                    downloadUrl: downloadUrl
                });
            } catch (error) {
                console.warn('Error parsing CORE entry:', error);
            }
        });

        return papers;
    }

    /**
     * Parse Semantic Scholar API response
     */
    parseSemanticScholarResponse(data) {
        if (!data.data) {
            return [];
        }

        const papers = [];

        data.data.forEach(item => {
            try {
                const title = item.title || 'No title';
                const authors = item.authors?.map(author => author.name).filter(name => name) || [];
                const abstract = item.abstract || 'No abstract available';
                const publishedDate = item.year ? `${item.year}-01-01` : '';
                const journal = item.venue || 'Unknown venue';
                const pdfUrl = item.openAccessPdf?.url || null;

                papers.push({
                    id: `semantic_${item.paperId || Utils.generateId()}`,
                    title: title,
                    authors: authors,
                    abstract: abstract,
                    publishedDate: publishedDate,
                    source: 'Semantic Scholar',
                    url: item.url || '',
                    doi: item.externalIds?.DOI || null,
                    citationCount: item.citationCount || 0,
                    influentialCitationCount: item.influentialCitationCount || 0,
                    categories: [],
                    journal: journal,
                    downloadUrl: pdfUrl
                });
            } catch (error) {
                console.warn('Error parsing Semantic Scholar entry:', error);
            }
        });

        return papers;
    }

    /**
     * Parse OpenAlex API response
     */
    parseOpenAlexResponse(data) {
        if (!data.results) {
            return [];
        }

        const papers = [];

        data.results.forEach(item => {
            try {
                const title = item.title || 'No title';
                const authors = item.authorships?.map(authorship => 
                    authorship.author?.display_name
                ).filter(name => name) || [];
                
                const abstract = item.abstract || 'No abstract available';
                const publishedDate = item.publication_date || '';
                const journal = item.primary_location?.source?.display_name || 'Unknown journal';
                const pdfUrl = item.open_access?.oa_url || null;

                papers.push({
                    id: `openalex_${item.id?.replace('https://openalex.org/', '') || Utils.generateId()}`,
                    title: title,
                    authors: authors,
                    abstract: abstract,
                    publishedDate: publishedDate,
                    source: 'OpenAlex',
                    url: item.id || '',
                    doi: item.doi?.replace('https://doi.org/', '') || null,
                    citationCount: item.cited_by_count || 0,
                    categories: item.concepts?.map(concept => concept.display_name) || [],
                    journal: journal,
                    downloadUrl: pdfUrl
                });
            } catch (error) {
                console.warn('Error parsing OpenAlex entry:', error);
            }
        });

        return papers;
    }

    /**
     * Parse PubMed API response
     */
    parsePubMedResponse(xmlText) {
        const papers = [];
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlText, 'text/xml');
            const articles = doc.querySelectorAll('PubmedArticle');

            articles.forEach(article => {
                try {
                    const medlineCitation = article.querySelector('MedlineCitation');
                    const pmid = medlineCitation?.querySelector('PMID')?.textContent || '';
                    
                    const articleElement = medlineCitation?.querySelector('Article');
                    const title = articleElement?.querySelector('ArticleTitle')?.textContent || 'No title';
                    
                    const authorList = articleElement?.querySelectorAll('Author');
                    const authors = Array.from(authorList || []).map(author => {
                        const lastName = author.querySelector('LastName')?.textContent || '';
                        const firstName = author.querySelector('ForeName')?.textContent || '';
                        return `${firstName} ${lastName}`.trim();
                    }).filter(name => name);

                    const abstract = articleElement?.querySelector('Abstract AbstractText')?.textContent || 'No abstract available';
                    
                    const pubDate = articleElement?.querySelector('Journal JournalIssue PubDate');
                    const year = pubDate?.querySelector('Year')?.textContent || '';
                    const month = pubDate?.querySelector('Month')?.textContent || '01';
                    const day = pubDate?.querySelector('Day')?.textContent || '01';
                    const publishedDate = year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';

                    const journal = articleElement?.querySelector('Journal Title')?.textContent || 'Unknown journal';

                    papers.push({
                        id: `pubmed_${pmid || Utils.generateId()}`,
                        title: title,
                        authors: authors,
                        abstract: abstract,
                        publishedDate: publishedDate,
                        source: 'PubMed',
                        url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : '',
                        doi: null,
                        citationCount: null,
                        categories: [],
                        journal: journal,
                        downloadUrl: null
                    });
                } catch (error) {
                    console.warn('Error parsing PubMed article:', error);
                }
            });
        } catch (error) {
            console.error('Error parsing PubMed XML:', error);
        }

        return papers;
    }

    /**
     * Parse DOAJ API response
     */
    parseDOAJResponse(data) {
        if (!data.results) {
            return [];
        }

        const papers = [];

        data.results.forEach(item => {
            try {
                const bibjson = item.bibjson || {};
                const title = bibjson.title || 'No title';
                const authors = bibjson.author?.map(author => 
                    `${author.name || ''}`
                ).filter(name => name) || [];
                
                const abstract = bibjson.abstract || 'No abstract available';
                const publishedDate = bibjson.year ? `${bibjson.year}-01-01` : '';
                const journal = bibjson.journal?.title || 'Unknown journal';
                
                const pdfUrl = bibjson.link?.find(link => 
                    link.type === 'fulltext' && link.content_type === 'PDF'
                )?.url || null;

                papers.push({
                    id: `doaj_${item.id || Utils.generateId()}`,
                    title: title,
                    authors: authors,
                    abstract: abstract,
                    publishedDate: publishedDate,
                    source: 'DOAJ',
                    url: bibjson.link?.[0]?.url || '',
                    doi: bibjson.identifier?.find(id => id.type === 'doi')?.id || null,
                    citationCount: null,
                    categories: bibjson.subject || [],
                    journal: journal,
                    downloadUrl: pdfUrl
                });
            } catch (error) {
                console.warn('Error parsing DOAJ entry:', error);
            }
        });

        return papers;
    }

    /**
     * Merge and deduplicate results from multiple sources
     */
    mergeAndDeduplicate(results) {
        const merged = new Map();
        const seenTitles = new Set();

        results.forEach(paper => {
            // Create a normalized title for comparison
            const normalizedTitle = paper.title.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            // Skip if we've seen this title before (simple deduplication)
            if (seenTitles.has(normalizedTitle)) {
                return;
            }

            seenTitles.add(normalizedTitle);
            merged.set(paper.id, paper);
        });

        return Array.from(merged.values());
    }

    /**
     * Apply additional filters to results
     */
    applyFilters(results, filters) {
        let filtered = [...results];

        // Filter by year range
        if (filters.yearFrom || filters.yearTo) {
            const fromYear = filters.yearFrom ? parseInt(filters.yearFrom) : 1900;
            const toYear = filters.yearTo ? parseInt(filters.yearTo) : new Date().getFullYear();

            filtered = filtered.filter(paper => {
                const paperYear = new Date(paper.publishedDate).getFullYear();
                return paperYear >= fromYear && paperYear <= toYear;
            });
        }

        // Filter by author
        if (filters.author) {
            const authorQuery = filters.author.toLowerCase();
            filtered = filtered.filter(paper => 
                paper.authors.some(author => 
                    author.toLowerCase().includes(authorQuery)
                )
            );
        }

        return filtered;
    }

    /**
     * Sort results based on criteria
     */
    sortResults(results, sortBy) {
        const sorted = [...results];

        switch (sortBy) {
            case 'date':
                sorted.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
                break;
            case 'citations':
                sorted.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
                break;
            case 'quality':
                sorted.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
                break;
            case 'impact':
                sorted.sort((a, b) => (b.impactMetrics?.academicImpact || 0) - (a.impactMetrics?.academicImpact || 0));
                break;
            case 'velocity':
                sorted.sort((a, b) => (b.impactMetrics?.citationVelocity || 0) - (a.impactMetrics?.citationVelocity || 0));
                break;
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'relevance':
            default:
                // Sort by relevance score if available, otherwise keep original order
                if (results.some(r => r.relevanceScore)) {
                    sorted.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
                }
                break;
        }

        return sorted;
    }

    /**
     * Get paginated results
     */
    getPage(page, perPage = CONFIG.SEARCH.DEFAULT_PER_PAGE) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        
        return {
            results: this.currentResults.slice(start, end),
            page: page,
            perPage: perPage,
            total: this.totalResults,
            totalPages: Math.ceil(this.totalResults / perPage)
        };
    }

    /**
     * Export results in different formats
     */
    exportResults(format = 'json') {
        const results = this.currentResults;

        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(results);
            case 'json':
                return this.exportToJSON(results);
            default:
                throw new Error('Unsupported export format');
        }
    }

    /**
     * Export to CSV format
     */
    exportToCSV(results) {
        if (!results.length) return '';

        const headers = ['Title', 'Authors', 'Abstract', 'Published Date', 'Source', 'Journal', 'DOI', 'URL'];
        const csvContent = [
            headers.join(','),
            ...results.map(paper => [
                `"${paper.title.replace(/"/g, '""')}"`,
                `"${paper.authors.join('; ').replace(/"/g, '""')}"`,
                `"${Utils.truncateText(paper.abstract, 200).replace(/"/g, '""')}"`,
                paper.publishedDate || '',
                paper.source || '',
                `"${paper.journal.replace(/"/g, '""')}"`,
                paper.doi || '',
                paper.url || ''
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Export to JSON format
     */
    exportToJSON(results) {
        return JSON.stringify(results, null, 2);
    }

    /**
     * Generate cache key
     */
    generateCacheKey(query, filters) {
        return btoa(JSON.stringify({ query, filters }));
    }

    /**
     * Add search to history
     */
    addToSearchHistory(query) {
        if (!query.trim()) return;

        let history = this.loadSearchHistory();
        
        // Remove if already exists
        history = history.filter(item => item.query !== query);
        
        // Add to beginning
        history.unshift({
            query: query,
            timestamp: Date.now()
        });

        // Keep only last 10 searches
        history = history.slice(0, 10);

        this.searchHistory = history;
        localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(history));
    }

    /**
     * Load search history from storage
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    /**
     * Get search suggestions
     */
    getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];

        const suggestions = [];
        
        // Add from search history
        this.searchHistory.forEach(item => {
            if (item.query.toLowerCase().includes(query.toLowerCase()) && 
                item.query !== query) {
                suggestions.push({
                    text: item.query,
                    type: 'history'
                });
            }
        });

        // Add common academic terms
        const commonTerms = [
            'machine learning', 'artificial intelligence', 'deep learning',
            'neural networks', 'natural language processing', 'computer vision',
            'quantum computing', 'blockchain', 'bioinformatics', 'robotics'
        ];

        commonTerms.forEach(term => {
            if (term.toLowerCase().includes(query.toLowerCase()) && 
                term !== query &&
                !suggestions.find(s => s.text === term)) {
                suggestions.push({
                    text: term,
                    type: 'suggestion'
                });
            }
        });

        return suggestions.slice(0, 5);
    }

    /**
     * Enrich papers with citation data from OpenCitations
     */
    async enrichWithCitations(papers) {
        const enrichedPapers = [];
        const rateLimiter = this.createRateLimiter(CONFIG.SEARCH.RATE_LIMITS.OPENCITATIONS);

        for (const paper of papers) {
            try {
                await rateLimiter();
                
                if (paper.doi) {
                    const citationData = await this.getCitationData(paper.doi);
                    enrichedPapers.push({
                        ...paper,
                        citingPapers: citationData.citing || [],
                        citedPapers: citationData.cited || [],
                        citationNetwork: citationData.network || {}
                    });
                } else {
                    enrichedPapers.push(paper);
                }
            } catch (error) {
                console.warn('Error enriching citations for paper:', paper.id, error);
                enrichedPapers.push(paper);
            }
        }

        return enrichedPapers;
    }

    /**
     * Enrich papers with author information from ORCID
     */
    async enrichWithAuthorInfo(papers) {
        const enrichedPapers = [];
        const rateLimiter = this.createRateLimiter(CONFIG.SEARCH.RATE_LIMITS.ORCID);

        for (const paper of papers) {
            try {
                const enrichedAuthors = [];
                
                for (const authorName of paper.authors) {
                    await rateLimiter();
                    
                    const authorInfo = await this.getAuthorInfo(authorName);
                    enrichedAuthors.push({
                        name: authorName,
                        orcid: authorInfo.orcid || null,
                        affiliation: authorInfo.affiliation || null,
                        h_index: authorInfo.h_index || null,
                        totalCitations: authorInfo.totalCitations || null
                    });
                }

                enrichedPapers.push({
                    ...paper,
                    authors: enrichedAuthors
                });
            } catch (error) {
                console.warn('Error enriching author info for paper:', paper.id, error);
                enrichedPapers.push(paper);
            }
        }

        return enrichedPapers;
    }

    /**
     * Enrich papers with additional metrics
     */
    async enrichWithMetrics(papers) {
        const enrichedPapers = [];

        for (const paper of papers) {
            try {
                // Calculate relevance score based on multiple factors
                const relevanceScore = this.calculateRelevanceScore(paper);
                
                // Add impact metrics
                const impactMetrics = this.calculateImpactMetrics(paper);
                
                enrichedPapers.push({
                    ...paper,
                    relevanceScore: relevanceScore,
                    impactMetrics: impactMetrics,
                    qualityScore: this.calculateQualityScore(paper)
                });
            } catch (error) {
                console.warn('Error calculating metrics for paper:', paper.id, error);
                enrichedPapers.push(paper);
            }
        }

        return enrichedPapers;
    }

    /**
     * Get citation data from OpenCitations API
     */
    async getCitationData(doi) {
        try {
            const citingUrl = `${CONFIG.APIS.OPENCITATIONS}/citations/${encodeURIComponent(doi)}`;
            const citedUrl = `${CONFIG.APIS.OPENCITATIONS}/references/${encodeURIComponent(doi)}`;

            const [citingResponse, citedResponse] = await Promise.allSettled([
                fetch(citingUrl),
                fetch(citedUrl)
            ]);

            const result = {
                citing: [],
                cited: [],
                network: {}
            };

            if (citingResponse.status === 'fulfilled' && citingResponse.value.ok) {
                const citingData = await citingResponse.value.json();
                result.citing = citingData.slice(0, 10); // Limit to 10 citing papers
            }

            if (citedResponse.status === 'fulfilled' && citedResponse.value.ok) {
                const citedData = await citedResponse.value.json();
                result.cited = citedData.slice(0, 10); // Limit to 10 cited papers
            }

            return result;
        } catch (error) {
            console.error('Error fetching citation data:', error);
            return { citing: [], cited: [], network: {} };
        }
    }

    /**
     * Get author information from ORCID API
     */
    async getAuthorInfo(authorName) {
        try {
            const searchUrl = `${CONFIG.APIS.ORCID}/search`;
            const params = new URLSearchParams({
                q: `given-names:${authorName.split(' ')[0]} AND family-name:${authorName.split(' ').slice(1).join(' ')}`,
                rows: 1
            });

            const response = await fetch(`${searchUrl}?${params}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                return {};
            }

            const data = await response.json();
            const person = data['result']?.[0];

            if (!person) {
                return {};
            }

            // Get detailed info
            const orcidId = person['orcid-identifier']['path'];
            const detailUrl = `${CONFIG.APIS.ORCID}/${orcidId}/person`;
            
            const detailResponse = await fetch(detailUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!detailResponse.ok) {
                return { orcid: orcidId };
            }

            const detailData = await detailResponse.json();
            
            return {
                orcid: orcidId,
                affiliation: detailData.name?.['institution-name']?.value || null,
                h_index: null, // ORCID doesn't provide h-index directly
                totalCitations: null
            };
        } catch (error) {
            console.error('Error fetching author info:', error);
            return {};
        }
    }

    /**
     * Calculate relevance score for a paper
     */
    calculateRelevanceScore(paper) {
        let score = 0;
        
        // Citation count factor (normalized)
        if (paper.citationCount) {
            score += Math.min(paper.citationCount / 100, 1) * 30;
        }
        
        // Recent publication factor
        if (paper.publishedDate) {
            const year = new Date(paper.publishedDate).getFullYear();
            const currentYear = new Date().getFullYear();
            const ageScore = Math.max(0, 1 - (currentYear - year) / 10);
            score += ageScore * 20;
        }
        
        // Abstract quality factor
        if (paper.abstract && paper.abstract.length > 100) {
            score += 20;
        }
        
        // PDF availability factor
        if (paper.downloadUrl) {
            score += 15;
        }
        
        // Journal reputation factor (simplified)
        if (paper.journal && !paper.journal.includes('Unknown')) {
            score += 15;
        }
        
        return Math.round(score);
    }

    /**
     * Calculate impact metrics for a paper
     */
    calculateImpactMetrics(paper) {
        return {
            citationVelocity: this.calculateCitationVelocity(paper),
            socialImpact: this.calculateSocialImpact(paper),
            academicImpact: this.calculateAcademicImpact(paper)
        };
    }

    /**
     * Calculate quality score for a paper
     */
    calculateQualityScore(paper) {
        let score = 0;
        
        // Title quality
        if (paper.title && paper.title.length > 10 && !paper.title.includes('No title')) {
            score += 25;
        }
        
        // Abstract quality
        if (paper.abstract && paper.abstract.length > 200 && !paper.abstract.includes('No abstract')) {
            score += 35;
        }
        
        // Author information completeness
        if (paper.authors && paper.authors.length > 0) {
            score += 20;
        }
        
        // DOI availability
        if (paper.doi) {
            score += 20;
        }
        
        return Math.round(score);
    }

    /**
     * Calculate citation velocity (citations per year since publication)
     */
    calculateCitationVelocity(paper) {
        if (!paper.citationCount || !paper.publishedDate) {
            return 0;
        }
        
        const publicationYear = new Date(paper.publishedDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const yearsSincePublication = Math.max(1, currentYear - publicationYear);
        
        return Math.round(paper.citationCount / yearsSincePublication * 10) / 10;
    }

    /**
     * Calculate social impact score
     */
    calculateSocialImpact(paper) {
        // Simplified social impact calculation
        // In real implementation, this would use Altmetric or similar APIs
        let score = 0;
        
        if (paper.source === 'ArXiv') score += 5;
        if (paper.downloadUrl) score += 10;
        if (paper.citationCount > 50) score += 15;
        
        return score;
    }

    /**
     * Calculate academic impact score
     */
    calculateAcademicImpact(paper) {
        let score = 0;
        
        if (paper.citationCount) {
            score += Math.min(paper.citationCount / 10, 50);
        }
        
        if (paper.influentialCitationCount) {
            score += paper.influentialCitationCount * 2;
        }
        
        return Math.round(score);
    }

    /**
     * Create rate limiter for API calls
     */
    createRateLimiter(requestsPerSecond) {
        const interval = 1000 / requestsPerSecond;
        let lastRequest = 0;
        
        return async () => {
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequest;
            
            if (timeSinceLastRequest < interval) {
                await new Promise(resolve => 
                    setTimeout(resolve, interval - timeSinceLastRequest)
                );
            }
            
            lastRequest = Date.now();
        };
    }
}

// ===== UI MANAGER =====
class UIManager {
    constructor(searchEngine) {
        this.searchEngine = searchEngine;
        this.currentPage = 1;
        this.bookmarks = this.loadBookmarks();
        
        // DOM elements
        this.elements = {};
        this.bindElements();
        this.initializeEventListeners();
        this.initializeTheme();
        this.initializeKeyboardShortcuts();
        
        // Debounced search function
        this.debouncedSearch = Utils.debounce(this.performSearch.bind(this), CONFIG.SEARCH.DEBOUNCE_DELAY);
        
        // Update bookmark count
        this.updateBookmarkCount();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements = {
            // Search elements
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            clearBtn: document.getElementById('clear-search'),
            
            // Filter elements
            sourceSelect: document.getElementById('source-select'),
            sortSelect: document.getElementById('sort-select'),
            advancedToggle: document.getElementById('advanced-filters-toggle'),
            advancedFilters: document.getElementById('advanced-filters'),
            
            // Advanced filter elements
            yearFrom: document.getElementById('year-from'),
            yearTo: document.getElementById('year-to'),
            authorInput: document.getElementById('author-input'),
            categorySelect: document.getElementById('category-select'),
            exactPhrase: document.getElementById('exact-phrase'),

            
            // Filter actions
            applyFilters: document.getElementById('apply-filters'),
            resetFilters: document.getElementById('reset-filters'),
            
            // Results elements
            loadingSpinner: document.getElementById('loading-spinner'),
            resultsSection: document.getElementById('results-section'),
            resultsTitle: document.getElementById('results-title'),
            resultsCount: document.getElementById('results-count'),
            resultsContainer: document.getElementById('results-container'),
            
            // Pagination elements
            paginationContainer: document.getElementById('pagination-container'),
            prevPage: document.getElementById('prev-page'),
            nextPage: document.getElementById('next-page'),
            pageNumbers: document.getElementById('page-numbers'),
            paginationText: document.getElementById('pagination-text'),

            
            // Export elements
            exportCSV: document.getElementById('export-csv'),
            exportJSON: document.getElementById('export-json'),
            printResults: document.getElementById('print-results'),
            
            // State elements
            emptyState: document.getElementById('empty-state'),
            errorState: document.getElementById('error-state'),
            
            // Theme and other elements
            themeToggle: document.getElementById('theme-toggle'),
            bookmarksFab: document.getElementById('bookmarks-fab'),
            bookmarksModal: document.getElementById('bookmarks-modal'),
            closeBookmarks: document.getElementById('close-bookmarks'),
            bookmarksList: document.getElementById('bookmarks-list'),
            bookmarkCount: document.getElementById('bookmark-count'),
            
            // Quick search tags
            quickSearchTags: document.querySelectorAll('.tag'),
            
            // Suggestions
            searchSuggestions: document.getElementById('search-suggestions'),
            recentSearches: document.getElementById('recent-searches'),
            
            // Error handling
            retrySearch: document.getElementById('retry-search'),
            clearFiltersBtn: document.getElementById('clear-filters-btn')
        };
        
        // Debug: Check if critical elements are found
        const criticalElements = ['loadingSpinner', 'resultsSection', 'emptyState', 'errorState', 'searchInput'];
        criticalElements.forEach(key => {
            if (!this.elements[key]) {
                console.error(`Critical element not found: ${key}`);
            } else {
                console.log(`Element found: ${key}`);
            }
        });
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Search functionality
        this.elements.searchInput?.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        this.elements.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        this.elements.searchBtn?.addEventListener('click', () => {
            this.performSearch();
        });

        this.elements.clearBtn?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Filter functionality
        this.elements.advancedToggle?.addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });

        this.elements.applyFilters?.addEventListener('click', () => {
            this.performSearch();
        });

        this.elements.resetFilters?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Quick search tags
        this.elements.quickSearchTags?.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.getAttribute('data-query');
                this.elements.searchInput.value = query;
                this.performSearch();
            });
        });

        // Pagination
        this.elements.prevPage?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.goToPage(this.currentPage - 1);
            }
        });

        this.elements.nextPage?.addEventListener('click', () => {
            const maxPages = Math.ceil(this.searchEngine.totalResults / 10);
            if (this.currentPage < maxPages) {
                this.goToPage(this.currentPage + 1);
            }
        });

        // Export functionality
        this.elements.exportCSV?.addEventListener('click', () => {
            this.exportResults('csv');
        });

        this.elements.exportJSON?.addEventListener('click', () => {
            this.exportResults('json');
        });

        this.elements.printResults?.addEventListener('click', () => {
            window.print();
        });

        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Bookmarks
        this.elements.bookmarksFab?.addEventListener('click', () => {
            this.showBookmarks();
        });

        this.elements.closeBookmarks?.addEventListener('click', () => {
            this.hideBookmarks();
        });



        // Error handling
        this.elements.retrySearch?.addEventListener('click', () => {
            this.performSearch();
        });

        this.elements.clearFiltersBtn?.addEventListener('click', () => {
            this.resetFilters();
            this.performSearch();
        });

        // Modal click outside to close
        this.elements.bookmarksModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.bookmarksModal) {
                this.hideBookmarks();
            }
        });

        // Handle per-page change
        this.elements.perPageSelect?.addEventListener('change', () => {
            const newPerPage = parseInt(this.elements.perPageSelect.value);
            const currentTotal = this.searchEngine.currentResults?.length || 0;
            
            this.currentPerPage = newPerPage;
            this.currentPage = 1;
            
            // If we need more papers than currently available, search again
            if (newPerPage > currentTotal) {
                this.performSearch();
            } else {
                // We have enough papers, just re-render with new pagination
                if (currentTotal > 0) {
                    this.renderResults(this.searchEngine.currentResults);
                    Utils.showNotification(`Hiển thị ${Math.min(newPerPage, currentTotal)} trong số ${currentTotal} papers`, 'info');
                }
            }
        });



        // Handle sort change
        this.elements.sortSelect?.addEventListener('change', () => {
            this.performSearch();
        });

        // Focus and blur events for search suggestions
        this.elements.searchInput?.addEventListener('focus', () => {
            this.showSearchSuggestions();
        });

        this.elements.searchInput?.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                this.hideSearchSuggestions();
            }, 200);
        });


    }

    /**
     * Initialize theme
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        if (savedTheme === 'dark') {
            this.elements.themeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.elements.searchInput?.focus();
            }
            
            // Escape - Clear search or close modals
            if (e.key === 'Escape') {
                if (!this.elements.bookmarksModal.hidden) {
                    this.hideBookmarks();
                } else {
                    this.clearSearch();
                }
            }
            
            // Ctrl/Cmd + K - Show shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleShortcutsHelp();
            }
        });
    }

    /**
     * Handle search input changes
     */
    handleSearchInput(value) {
        if (value.trim()) {
            this.debouncedSearch();
            this.showSearchSuggestions();
        } else {
            this.hideSearchSuggestions();
        }
    }

    /**
     * Perform search
     */
    async performSearch() {
        const query = this.elements.searchInput?.value.trim();
        
        if (!query) {
            Utils.showNotification('Please enter a search query', 'error');
            return;
        }

        // Collect filters
        const filters = this.collectFilters();
        
        // Reset to first page for new search
        this.currentPage = 1;
        
        // Show loading state and clear all previous states
        this.showLoading();
        this.hideAllStates();

        try {
            console.log(' Starting search for:', query);
            
            // Show special message for large searches
            if (filters.perPage && filters.perPage >= 50) {
                Utils.showNotification('Đang tìm kiếm nhiều papers, vui lòng chờ...', 'info');
            }
            
            const results = await this.searchEngine.searchAll(query, filters);
            
            // Ensure results is always an array
            let safeResults = Array.isArray(results) ? results : [];
            console.log('Search completed, total results:', safeResults.length);
            
            // Apply data enrichment
            if (safeResults.length > 0 && safeResults.length <= 50) { // Only enrich for smaller result sets
                console.log('🔍 Enriching data...');
                try {
                    // Enrich with metrics (always apply)
                    safeResults = await this.searchEngine.enrichWithMetrics(safeResults);
                    
                    // Enrich with citations for papers with DOI (limited to first 20)
                    const papersWithDoi = safeResults.filter(p => p.doi).slice(0, 20);
                    if (papersWithDoi.length > 0) {
                        const enrichedCitations = await this.searchEngine.enrichWithCitations(papersWithDoi);
                        // Merge back into results
                        enrichedCitations.forEach(enriched => {
                            const index = safeResults.findIndex(p => p.id === enriched.id);
                            if (index !== -1) {
                                safeResults[index] = enriched;
                            }
                        });
                    }
                    
                    console.log('Data enrichment completed');
                } catch (enrichError) {
                    console.warn('Data enrichment failed:', enrichError);
                    // Continue with original results if enrichment fails
                }
            }
            
            // Clear all states first
            this.hideLoading();
            this.hideAllStates();
            
            if (safeResults.length === 0) {
                console.log(' No results found');
                this.showEmptyState();
            } else {
                console.log(' Rendering results...');
                this.renderResults(safeResults);
                this.showResultsSection();
                const successMsg = safeResults.length >= 50 ? 
                    `Tìm thấy ${safeResults.length} bài báo! 🎉` : 
                    `Found ${safeResults.length} papers`;
                Utils.showNotification(successMsg, 'success');
            }
            
        } catch (error) {
            console.error(' Search failed:', error);
            this.hideLoading();
            this.hideAllStates();
            this.showError(error.message);
            Utils.showNotification('Search failed: ' + error.message, 'error');
        }
    }

    /**
     * Collect current filter values
     */
    collectFilters() {
        return {
            source: this.elements.sourceSelect?.value || 'all',
            sort: this.elements.sortSelect?.value || 'relevance',
            perPage: CONFIG.SEARCH.MAX_RESULTS, // Get all available results
            yearFrom: this.elements.yearFrom?.value || null,
            yearTo: this.elements.yearTo?.value || null,
            author: this.elements.authorInput?.value.trim() || null,
            category: this.elements.categorySelect?.value || null,
            exactPhrase: this.elements.exactPhrase?.checked || false
        };
    }

    /**
     * Render search results
     */
    renderResults(allResults) {
        // Display results with pagination (10 papers per page)
        const pageData = this.searchEngine.getPage(this.currentPage, 10);
        const { results, page, perPage, total, totalPages } = pageData;

        // Update results info
        if (this.elements.resultsCount) {
            this.elements.resultsCount.textContent = `Found ${total} papers`;
        }

        // Clear previous results
        if (this.elements.resultsContainer) {
            this.elements.resultsContainer.innerHTML = '';
        }

        // Render paper cards for current page
        results.forEach(paper => {
            const paperCard = this.createPaperCard(paper);
            this.elements.resultsContainer?.appendChild(paperCard);
        });

        // Update pagination
        this.updatePagination(page, totalPages, total);

        // Scroll to results
        if (this.elements.resultsSection) {
            Utils.scrollToElement(this.elements.resultsSection, 80);
        }
    }

    /**
     * Create paper card element
     */
    createPaperCard(paper) {
        const card = document.createElement('div');
        card.className = 'paper-card';
        card.setAttribute('data-paper-id', paper.id);

        const isBookmarked = this.isBookmarked(paper.id);

        card.innerHTML = `
            <div class="paper-header">
                <div class="paper-title">
                    <h3>
                        ${paper.url ? `<a href="${paper.url}" target="_blank" rel="noopener">${Utils.sanitizeHTML(paper.title)}</a>` : Utils.sanitizeHTML(paper.title)}
                    </h3>
                </div>
                <div class="bookmark-actions">
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                            data-paper-id="${paper.id}" 
                            title="${isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
            
            <div class="paper-meta">
                ${paper.authors.length > 0 ? `
                    <div class="paper-meta-item">
                        <i class="fas fa-user"></i>
                        <span>${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''}</span>
                    </div>
                ` : ''}
                
                ${paper.publishedDate ? `
                    <div class="paper-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${Utils.formatDate(paper.publishedDate)}</span>
                    </div>
                ` : ''}
                
                ${paper.citationCount !== null && paper.citationCount > 0 ? `
                    <div class="paper-meta-item">
                        <i class="fas fa-quote-right"></i>
                        <span>${paper.citationCount} citations</span>
                        ${paper.influentialCitationCount ? `<span class="influential-citations"> (${paper.influentialCitationCount} influential)</span>` : ''}
                    </div>
                ` : ''}
                
                ${paper.relevanceScore ? `
                    <div class="paper-meta-item">
                        <i class="fas fa-star"></i>
                        <span>Relevance: ${paper.relevanceScore}%</span>
                    </div>
                ` : ''}
                
                ${paper.qualityScore ? `
                    <div class="paper-meta-item">
                        <i class="fas fa-award"></i>
                        <span>Quality: ${paper.qualityScore}%</span>
                    </div>
                ` : ''}
                
                <div class="paper-meta-item">
                    <i class="fas fa-database"></i>
                    <span>${paper.journal}</span>
                </div>
            </div>

            <div class="paper-abstract">
                <div class="abstract-preview">
                    ${Utils.sanitizeHTML(Utils.truncateText(paper.abstract, 300))}
                </div>
                ${paper.abstract.length > 300 ? `
                    <button class="expand-abstract" data-paper-id="${paper.id}">
                        <span>Show more</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                ` : ''}
            </div>

            <div class="paper-badges">
                <span class="badge badge-source">
                    <i class="fas fa-database"></i>
                    ${paper.source}
                </span>
                
                ${paper.categories.slice(0, 3).map(cat => `
                    <span class="badge badge-category">${Utils.sanitizeHTML(cat)}</span>
                `).join('')}
                
                ${paper.citationCount !== null && paper.citationCount > 0 ? `
                    <span class="badge badge-citation">
                        <i class="fas fa-quote-right"></i>
                        ${paper.citationCount}
                    </span>
                ` : ''}
                
                ${paper.impactMetrics?.citationVelocity > 0 ? `
                    <span class="badge badge-velocity">
                        <i class="fas fa-tachometer-alt"></i>
                        ${paper.impactMetrics.citationVelocity}/year
                    </span>
                ` : ''}
                
                ${paper.impactMetrics?.academicImpact > 20 ? `
                    <span class="badge badge-impact">
                        <i class="fas fa-fire"></i>
                        High Impact
                    </span>
                ` : ''}
                
                ${paper.downloadUrl ? `
                    <span class="badge badge-open-access">
                        <i class="fas fa-unlock"></i>
                        Open Access
                    </span>
                ` : ''}
            </div>

            <div class="paper-actions">
                ${paper.url ? `
                    <a href="${paper.url}" target="_blank" rel="noopener" class="action-btn">
                        <i class="fas fa-external-link-alt"></i>
                        View Paper
                    </a>
                ` : ''}
                
                ${paper.downloadUrl ? `
                    <a href="${paper.downloadUrl}" target="_blank" rel="noopener" class="action-btn">
                        <i class="fas fa-download"></i>
                        Download PDF
                    </a>
                ` : ''}
                
                ${paper.doi ? `
                    <a href="https://doi.org/${paper.doi}" target="_blank" rel="noopener" class="action-btn">
                        <i class="fas fa-link"></i>
                        DOI
                    </a>
                ` : ''}
                
                <button class="action-btn share-btn" data-paper-id="${paper.id}">
                    <i class="fas fa-share"></i>
                    Share
                </button>
            </div>
        `;

        // Add event listeners
        this.addPaperCardListeners(card, paper);

        return card;
    }

    /**
     * Add event listeners to paper card
     */
    addPaperCardListeners(card, paper) {
        // Bookmark button
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn?.addEventListener('click', () => {
            this.toggleBookmark(paper);
        });

        // Expand abstract button
        const expandBtn = card.querySelector('.expand-abstract');
        expandBtn?.addEventListener('click', () => {
            this.toggleAbstract(card, paper);
        });

        // Share button
        const shareBtn = card.querySelector('.share-btn');
        shareBtn?.addEventListener('click', () => {
            this.sharePaper(paper);
        });
    }

    /**
     * Toggle abstract expansion
     */
    toggleAbstract(card, paper) {
        const abstractDiv = card.querySelector('.paper-abstract');
        const previewDiv = abstractDiv.querySelector('.abstract-preview');
        const expandBtn = abstractDiv.querySelector('.expand-abstract');
        
        if (previewDiv.classList.contains('abstract-full')) {
            // Collapse
            previewDiv.className = 'abstract-preview';
            previewDiv.innerHTML = Utils.sanitizeHTML(Utils.truncateText(paper.abstract, 300));
            expandBtn.innerHTML = '<span>Show more</span><i class="fas fa-chevron-down"></i>';
        } else {
            // Expand
            previewDiv.className = 'abstract-preview abstract-full';
            previewDiv.innerHTML = Utils.sanitizeHTML(paper.abstract);
            expandBtn.innerHTML = '<span>Show less</span><i class="fas fa-chevron-up"></i>';
        }
    }

    /**
     * Share paper
     */
    sharePaper(paper) {
        if (navigator.share) {
            navigator.share({
                title: paper.title,
                text: `Check out this research paper: ${paper.title}`,
                url: paper.url || window.location.href
            }).catch(console.error);
        } else {
            // Fallback to clipboard
            const shareText = `${paper.title}\n${paper.url || window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                Utils.showNotification('Link copied to clipboard', 'success');
            }).catch(() => {
                Utils.showNotification('Failed to copy link', 'error');
            });
        }
    }

    /**
     * Update pagination
     */
    updatePagination(currentPage, totalPages, totalResults) {
        this.currentPage = currentPage;

        // Update pagination text
        if (this.elements.paginationText) {
            this.elements.paginationText.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        // Update navigation buttons
        if (this.elements.prevPage) {
            this.elements.prevPage.disabled = currentPage <= 1;
        }
        if (this.elements.nextPage) {
            this.elements.nextPage.disabled = currentPage >= totalPages;
        }

        // Update page numbers
        this.renderPageNumbers(currentPage, totalPages);

        // Show/hide pagination
        if (this.elements.paginationContainer) {
            this.elements.paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
        }
    }

    /**
     * Render page numbers
     */
    renderPageNumbers(currentPage, totalPages) {
        if (!this.elements.pageNumbers) return;

        this.elements.pageNumbers.innerHTML = '';

        if (totalPages <= 1) return;

        const maxVisible = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // First page
        if (startPage > 1) {
            this.addPageNumber(1, currentPage);
            if (startPage > 2) {
                this.addEllipsis();
            }
        }

        // Visible pages
        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i, currentPage);
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                this.addEllipsis();
            }
            this.addPageNumber(totalPages, currentPage);
        }
    }

    /**
     * Add page number button
     */
    addPageNumber(pageNum, currentPage) {
        const button = document.createElement('button');
        button.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
        button.textContent = pageNum;
        button.addEventListener('click', () => this.goToPage(pageNum));
        this.elements.pageNumbers?.appendChild(button);
    }

    /**
     * Add ellipsis
     */
    addEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-number ellipsis';
        ellipsis.textContent = '...';
        this.elements.pageNumbers?.appendChild(ellipsis);
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        if (page >= 1 && page <= Math.ceil(this.searchEngine.totalResults / 10)) {
            this.currentPage = page;
            this.renderResults();
        }
    }

    /**
     * Bookmark management
     */
    toggleBookmark(paper) {
        if (this.isBookmarked(paper.id)) {
            this.removeBookmark(paper.id);
            Utils.showNotification('Removed from bookmarks', 'success');
        } else {
            this.addBookmark(paper);
            Utils.showNotification('Added to bookmarks', 'success');
        }
        this.updateBookmarkCount();
        this.updateBookmarkButtons();
    }

    addBookmark(paper) {
        this.bookmarks.set(paper.id, {
            ...paper,
            bookmarkedAt: Date.now()
        });
        this.saveBookmarks();
    }

    removeBookmark(paperId) {
        this.bookmarks.delete(paperId);
        this.saveBookmarks();
    }

    isBookmarked(paperId) {
        return this.bookmarks.has(paperId);
    }

    saveBookmarks() {
        const bookmarksArray = Array.from(this.bookmarks.values());
        localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarksArray));
    }

    loadBookmarks() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKMARKS);
            const bookmarksArray = stored ? JSON.parse(stored) : [];
            return new Map(bookmarksArray.map(paper => [paper.id, paper]));
        } catch {
            return new Map();
        }
    }

    updateBookmarkCount() {
        const count = this.bookmarks.size;
        if (this.elements.bookmarkCount) {
            if (count > 0) {
                this.elements.bookmarkCount.textContent = count;
                this.elements.bookmarkCount.hidden = false;
            } else {
                this.elements.bookmarkCount.hidden = true;
            }
        }
    }

    updateBookmarkButtons() {
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const paperId = btn.getAttribute('data-paper-id');
            const isBookmarked = this.isBookmarked(paperId);
            btn.className = `bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`;
            btn.title = isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks';
        });
    }

    showBookmarks() {
        this.elements.bookmarksModal.style.display = 'flex';
        this.renderBookmarksList();
    }

    hideBookmarks() {
        this.elements.bookmarksModal.style.display = 'none';
    }

    renderBookmarksList() {
        if (!this.elements.bookmarksList) return;

        this.elements.bookmarksList.innerHTML = '';

        if (this.bookmarks.size === 0) {
            this.elements.bookmarksList.innerHTML = `
                <div class="empty-bookmarks">
                    <i class="fas fa-bookmark" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No bookmarks yet</h3>
                    <p>Bookmark papers to save them for later reading</p>
                </div>
            `;
            return;
        }

        const sortedBookmarks = Array.from(this.bookmarks.values())
            .sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);

        sortedBookmarks.forEach(paper => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.innerHTML = `
                <div class="bookmark-info">
                    <h4>${paper.url ? `<a href="${paper.url}" target="_blank">${Utils.sanitizeHTML(paper.title)}</a>` : Utils.sanitizeHTML(paper.title)}</h4>
                    <p>${Utils.sanitizeHTML(Utils.truncateText(paper.abstract, 150))}</p>
                    <small>Bookmarked ${Utils.formatDate(new Date(paper.bookmarkedAt))}</small>
                </div>
                <button class="bookmark-remove" data-paper-id="${paper.id}" title="Remove bookmark">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Add remove listener
            const removeBtn = bookmarkItem.querySelector('.bookmark-remove');
            removeBtn.addEventListener('click', () => {
                this.removeBookmark(paper.id);
                this.updateBookmarkCount();
                this.renderBookmarksList();
                this.updateBookmarkButtons();
                Utils.showNotification('Bookmark removed', 'success');
            });

            this.elements.bookmarksList.appendChild(bookmarkItem);
        });
    }

    /**
     * Search suggestions
     */
    showSearchSuggestions() {
        const query = this.elements.searchInput?.value.trim();
        
        if (!query || query.length < 2) {
            this.showRecentSearches();
            return;
        }

        const suggestions = this.searchEngine.getSearchSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        this.elements.searchSuggestions.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <i class="fas ${suggestion.type === 'history' ? 'fa-history' : 'fa-lightbulb'}"></i>
                <span>${Utils.sanitizeHTML(suggestion.text)}</span>
            `;
            
            item.addEventListener('click', () => {
                this.elements.searchInput.value = suggestion.text;
                this.hideSearchSuggestions();
                this.performSearch();
            });
            
            this.elements.searchSuggestions.appendChild(item);
        });

        this.elements.searchSuggestions.hidden = false;
        this.elements.recentSearches.hidden = true;
    }

    showRecentSearches() {
        const recentSearches = this.searchEngine.loadSearchHistory();
        
        if (recentSearches.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        const recentList = this.elements.recentSearches.querySelector('.recent-searches-list');
        recentList.innerHTML = '';

        recentSearches.slice(0, 5).forEach(search => {
            const item = document.createElement('button');
            item.className = 'recent-search-item';
            item.innerHTML = `
                <i class="fas fa-history"></i>
                <span>${Utils.sanitizeHTML(search.query)}</span>
            `;
            
            item.addEventListener('click', () => {
                this.elements.searchInput.value = search.query;
                this.hideSearchSuggestions();
                this.performSearch();
            });
            
            recentList.appendChild(item);
        });

        this.elements.recentSearches.hidden = false;
        this.elements.searchSuggestions.hidden = true;
    }

    hideSearchSuggestions() {
        this.elements.searchSuggestions.hidden = true;
        this.elements.recentSearches.hidden = true;
    }

    /**
     * Export functionality
     */
    exportResults(format) {
        try {
            const data = this.searchEngine.exportResults(format);
            const blob = new Blob([data], { 
                type: format === 'csv' ? 'text/csv' : 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `search_results_${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Utils.showNotification(`Results exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            Utils.showNotification(`Export failed: ${error.message}`, 'error');
        }
    }

    /**
     * UI State management
     */
    showLoading() {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.style.display = 'flex';
            console.log('Loading spinner shown');
        }
    }

    hideLoading() {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.style.display = 'none';
            console.log(' Loading spinner hidden');
        }
    }

    showResultsSection() {
        if (this.elements.resultsSection) {
            this.elements.resultsSection.style.display = 'block';
            console.log(' Results section shown');
        }
    }

    hideResultsSection() {
        if (this.elements.resultsSection) {
            this.elements.resultsSection.style.display = 'none';
        }
    }

    showEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'flex';
            console.log(' Empty state shown');
        }
    }

    hideEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }
    }

    showError(message) {
        if (this.elements.errorState) {
            this.elements.errorState.style.display = 'flex';
            const errorMessage = this.elements.errorState.querySelector('#error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            console.log(' Error state shown:', message);
        }
    }

    hideError() {
        if (this.elements.errorState) {
            this.elements.errorState.style.display = 'none';
        }
    }

    hideAllStates() {
        console.log(' Hiding all states...');
        this.hideResultsSection();
        this.hideEmptyState();
        this.hideError();
        // Make sure loading is also hidden
        this.hideLoading();
    }

    /**
     * Filter management
     */
    toggleAdvancedFilters() {
        const isHidden = this.elements.advancedFilters.hidden;
        this.elements.advancedFilters.hidden = !isHidden;
        
        this.elements.advancedToggle.classList.toggle('active', !isHidden);
        
        if (!isHidden) {
            // Focus first input when opening
            this.elements.yearFrom?.focus();
        }
    }

    resetFilters() {
        // Reset all filter inputs
        if (this.elements.sourceSelect) this.elements.sourceSelect.value = 'all';
        if (this.elements.sortSelect) this.elements.sortSelect.value = 'relevance';
        if (this.elements.yearFrom) this.elements.yearFrom.value = '';
        if (this.elements.yearTo) this.elements.yearTo.value = '';
        if (this.elements.authorInput) this.elements.authorInput.value = '';
        if (this.elements.categorySelect) this.elements.categorySelect.value = '';
        if (this.elements.exactPhrase) this.elements.exactPhrase.checked = false;
        
        // Reset pagination
        this.currentPage = 1;
        
        Utils.showNotification('Filters reset', 'success');
    }

    clearSearch() {
        this.elements.searchInput.value = '';
        this.currentPage = 1;
        this.hideAllStates();
        this.hideSearchSuggestions();
        this.elements.searchInput.focus();
    }

    /**
     * Theme management
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
        
        // Update icon
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        Utils.showNotification(`Switched to ${newTheme} theme`, 'success');
    }



    /**
     * Shortcuts help
     */
    toggleShortcutsHelp() {
        const help = document.getElementById('shortcuts-help');
        if (help) {
            help.hidden = !help.hidden;
            
            if (!help.hidden) {
                setTimeout(() => {
                    help.hidden = true;
                }, 3000);
            }
        }
    }

    /**
     * Debug function to test UI states
     */
    testUIStates() {
        console.log(' Testing UI states...');
        
        console.log('Testing loading state...');
        this.showLoading();
        setTimeout(() => {
            console.log('Hiding loading state...');
            this.hideLoading();
            
            console.log('Testing error state...');
            this.showError('Test error message');
            setTimeout(() => {
                console.log('Hiding error state...');
                this.hideError();
                
                console.log('Testing empty state...');
                this.showEmptyState();
                setTimeout(() => {
                    console.log('Hiding empty state...');
                    this.hideEmptyState();
                    console.log('UI state test completed');
                }, 1000);
            }, 1000);
        }, 1000);
    }
}

// ===== APPLICATION INITIALIZATION =====
class App {
    constructor() {
        this.searchEngine = null;
        this.uiManager = null;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize search engine
            this.searchEngine = new PaperSearchEngine();
            
            // Initialize UI manager
            this.uiManager = new UIManager(this.searchEngine);
            

            
            console.log('Paper Search Tool initialized successfully');
            
            // Expose for debugging
            window.debugPaperTool = {
                testUIStates: () => this.uiManager.testUIStates(),
                searchEngine: this.searchEngine,
                uiManager: this.uiManager
            };
            
            console.log(' Debug tools available: window.debugPaperTool');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            Utils.showNotification('Failed to initialize application', 'error');
        }
    }


}

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Utils.showNotification('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showNotification('A network error occurred', 'error');
});

// ===== START APPLICATION =====
const app = new App(); 