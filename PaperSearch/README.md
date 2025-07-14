# Scientific Paper Search Tool

A comprehensive web application for searching academic papers from multiple scientific databases. Built with vanilla JavaScript, HTML5, and modern CSS for maximum compatibility and performance.

## 🔍 Overview

This tool provides researchers, students, and academics with a unified interface to search across **6 major scientific databases** simultaneously. It features advanced filtering, smart pagination, bookmarking, export capabilities, and a modern responsive design.

## ✨ Features

### 🎯 Core Search Functionality
- **Multi-Database Search**: Search across 6 databases simultaneously:
  - **ArXiv** - Preprint repository for physics, mathematics, computer science
  - **CrossRef** - DOI registration agency with extensive metadata
  - **Semantic Scholar** - AI-powered scientific literature search
  - **OpenAlex** - Open catalog of scholarly works and authors
  - **PubMed** - Biomedical and life sciences literature
  - **DOAJ** - Directory of Open Access Journals
- **Smart Pagination**: Display all found results, 10 papers per page for easy browsing
- **Real-time Suggestions**: Get search suggestions as you type
- **Search History**: Access your recent searches quickly
- **Advanced Filtering**: Filter by publication year, author, subject category, and more
- **Intelligent Deduplication**: Automatically removes duplicate papers from different sources
- **Multiple Sort Options**: Sort by relevance, date, citations, quality score, impact, or title

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes
- **Modern UI**: Clean, professional interface with smooth animations
- **Accessibility**: WCAG-compliant design with keyboard navigation support
- **Print-friendly**: Optimized printing layouts for research papers
- **Mobile-first**: Optimized for mobile research workflows

### 🚀 Advanced Features
- **Smart Bookmarks**: Save papers for later reading with persistent local storage
- **Export Options**: Export search results in CSV or JSON format
- **Efficient Pagination**: Browse through unlimited results, 10 papers per page
- **Quick Search Tags**: One-click searches for popular research topics
- **Keyboard Shortcuts**: Productivity shortcuts for power users
- **Performance Caching**: Cache search results for improved performance and offline access
- **Source Selection**: Choose specific databases or search all simultaneously

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- Internet connection for API access
- No installation or build process required!

### Installation

1. **Download or Clone**
   ```bash
   git clone https://github.com/your-username/paper-search-tool.git
   cd paper-search-tool
   ```

2. **Open in Browser**
   Simply open `index.html` in your web browser. That's it! 

3. **Start Searching**
   - Enter your search terms
   - Select data sources (or leave as "All Sources")
   - Browse unlimited results with smart pagination

## 📖 Usage Guide

### Basic Search
1. Enter your search terms in the search bar
2. Select data source(s):
   - **All Sources** (recommended) - Search all 6 databases
   - **ArXiv** - Physics, math, computer science preprints
   - **CrossRef** - Published papers with DOI
   - **Semantic Scholar** - AI-enhanced search
   - **OpenAlex** - Comprehensive academic catalog
   - **PubMed** - Biomedical literature
   - **DOAJ** - Open access journals
3. Click "Search" or press Enter
4. Browse through results (10 papers per page)

### Advanced Search
1. Click "Advanced Filters" to reveal additional options
2. Configure filters:
   - **Publication Year Range**: Filter by publication date
   - **Author**: Search for specific authors
   - **Category**: Filter by subject area (CS, Math, Physics, Biology, etc.)
   - **Exact Phrase**: Search for exact phrase matches
3. Click "Apply Filters" to search with your criteria

### Managing Results
- **View Paper**: Click paper title to open in new tab
- **Download PDF**: Click "Download PDF" when available
- **Bookmark**: Click the bookmark icon (🔖) to save papers locally
- **Share**: Use the share button to copy paper links
- **Export**: Export all found results as CSV or JSON
- **Print**: Print-friendly formatting available
- **Pagination**: Navigate through all results, 10 papers per page

### Bookmarks Management
- Click the bookmark icon on any paper to save it locally
- Access all bookmarks via the floating bookmark button (📑)
- Remove bookmarks from the bookmarks panel
- Bookmarks persist across browser sessions

## ⚙️ Configuration

### API Endpoints
The application connects to these scientific databases:

| Database | Endpoint | Format | Features |
|----------|----------|---------|----------|
| **ArXiv** | `https://export.arxiv.org/api/query` | XML | Preprints, open access |
| **CrossRef** | `https://api.crossref.org/works` | JSON | DOI metadata, citations |
| **Semantic Scholar** | `https://api.semanticscholar.org/graph/v1` | JSON | AI-enhanced search |
| **OpenAlex** | `https://api.openalex.org` | JSON | Comprehensive catalog |
| **PubMed** | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils` | XML | Biomedical literature |
| **DOAJ** | `https://doaj.org/api/search` | JSON | Open access journals |

### Search Configuration
```javascript
const CONFIG = {
    SEARCH: {
        DEFAULT_PER_PAGE: 20,    // Papers fetched per API call
        DISPLAY_PER_PAGE: 10,    // Papers shown per page
        MAX_RESULTS: 5000,       // Maximum total results
        DEBOUNCE_DELAY: 300,     // Search input delay (ms)
        CACHE_DURATION: 300000   // Cache duration (5 minutes)
    }
};
```

### CORS Handling
For ArXiv API access, the application uses a CORS proxy. You can modify this in the configuration:

```javascript
const CONFIG = {
    CORS_PROXY: 'https://api.allorigins.win/raw?url=',
    // Change to your preferred CORS proxy if needed
};
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + /` | Focus search bar |
| `Enter` | Perform search |
| `Esc` | Clear search or close modals |
| `Ctrl/Cmd + K` | Show keyboard shortcuts help |

## 📱 Browser Compatibility

### ✅ Fully Supported
- **Chrome** 70+ (Recommended)
- **Firefox** 65+
- **Safari** 12+
- **Edge** 79+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

### Feature Support
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Search & Filtering | ✅ | ✅ | ✅ | ✅ |
| Dark/Light Theme | ✅ | ✅ | ✅ | ✅ |
| Local Storage | ✅ | ✅ | ✅ | ✅ |
| Export Functionality | ✅ | ✅ | ✅ | ✅ |
| Web Share API | ✅ | ❌ | ✅ | ✅ |

## 🎨 Customization

### Custom Themes
Modify CSS variables in `styles.css` for custom theming:

```css
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --error-color: #ef4444;
  --background-color: #ffffff;
  --text-color: #1f2937;
  /* ... other variables */
}
```

### Adding New Databases
To integrate additional scientific databases:

1. **Add API endpoint** to `CONFIG.APIS`
2. **Implement search method** in `PaperSearchEngine`
3. **Add response parser** for the API format
4. **Update source selector** in HTML

Example implementation:
```javascript
async searchNewDatabase(query, filters = {}) {
    // Implement API call
    const response = await fetch(`${API_ENDPOINT}?q=${query}`);
    const data = await response.json();
    return this.parseNewDatabaseResponse(data);
}

parseNewDatabaseResponse(data) {
    // Parse and normalize response to standard format
    return data.results.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        url: paper.url,
        // ... other fields
    }));
}
```

## 🚀 Deployment

### Static Hosting (Recommended)

#### Netlify (One-click deploy)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/paper-search-tool)

1. Click the deploy button above
2. Connect your GitHub account
3. Your app will be live at `https://your-app-name.netlify.app`

#### Vercel
```bash
npm i -g vercel
vercel
```

#### GitHub Pages
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select source branch
4. Access at `https://your-username.github.io/repo-name`

### Performance Optimization
- Enable gzip compression
- Set cache headers for static assets
- Use CDN (Cloudflare recommended)
- Implement service worker for offline functionality

## 🔒 Security & Privacy

### 🛡️ Privacy Features
- **Client-side Only**: All processing happens in your browser
- **No Server Required**: No backend, no data collection
- **Local Storage Only**: Bookmarks stored locally on your device
- **No Tracking**: No analytics or user tracking
- **No Registration**: Use immediately without creating accounts

### 🔐 Security Features
- **Input Sanitization**: XSS protection for all user inputs
- **HTTPS Ready**: Designed for secure HTTPS deployment
- **CSP Compatible**: Content Security Policy headers supported
- **No API Key Exposure**: Secure handling of any required API keys

## 🐛 Troubleshooting

### Common Issues

#### "No results found"
- **Check internet connection**
- **Try different search terms** (broader or more specific)
- **Select different data sources** (some may be temporarily unavailable)
- **Check browser console** (F12) for error messages

#### Slow Search Performance
- **Reduce search scope** by selecting specific databases
- **Use more specific search terms** to reduce result set
- **Clear browser cache** and reload the page
- **Check available memory** (large result sets use more RAM)

#### API Rate Limits
| Database | Rate Limit | Solution |
|----------|------------|----------|
| CrossRef | 50 req/sec | Automatic rate limiting implemented |
| Semantic Scholar | 100 req/sec | Built-in throttling |
| ArXiv | No official limit | Respectful usage implemented |
| Others | Varies | Smart request management |

#### CORS Issues
- The app uses CORS proxy for some APIs
- If proxy is down, try refreshing the page
- For persistent issues, check `CONFIG.CORS_PROXY` setting

### Debug Mode
Open browser developer tools (F12) to see:
- API response details
- Search performance metrics
- Error messages
- Network request status

## 🤝 Contributing

We welcome contributions from the research community!

### 🛠️ Development Setup
1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/paper-search-tool.git
   cd paper-search-tool
   ```
3. **Make changes** and test in multiple browsers
4. **Submit a pull request**

### 💻 Code Guidelines
- **Modern JavaScript** (ES6+)
- **Mobile-first** responsive design
- **Accessibility** considerations
- **Performance** optimization
- **Comment complex logic**
- **Follow existing patterns**

### 🎯 Contribution Areas
- **New database integrations**
- **UI/UX improvements**
- **Performance optimizations**
- **Accessibility enhancements**
- **Documentation updates**
- **Bug fixes**

## 📊 API Rate Limits & Fair Usage

| Database | Requests/Second | Daily Limit | Notes |
|----------|----------------|-------------|-------|
| ArXiv | Respectful use | Unlimited | No official rate limit |
| CrossRef | 50 | ~4M | Built-in rate limiting |
| Semantic Scholar | 100 | ~8M | Academic use encouraged |
| OpenAlex | 10 | ~860K | Polite crawling policy |
| PubMed | 3 | ~259K | NCBI usage guidelines |
| DOAJ | 2 | ~172K | Fair usage policy |

The application implements smart rate limiting to respect these limits automatically.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Free for academic, commercial, and personal use. Attribution appreciated but not required.

## 🙏 Acknowledgments

### 📚 Data Sources
Special thanks to these organizations for providing open access to scientific literature:

- **[ArXiv](https://arxiv.org/)** - Cornell University's preprint repository
- **[CrossRef](https://www.crossref.org/)** - Official DOI registration agency  
- **[Semantic Scholar](https://www.semanticscholar.org/)** - AI2's literature search engine
- **[OpenAlex](https://openalex.org/)** - Open catalog of scholarly works
- **[PubMed](https://pubmed.ncbi.nlm.nih.gov/)** - NCBI's biomedical database
- **[DOAJ](https://doaj.org/)** - Directory of Open Access Journals

### 🛠️ Technologies
- **Vanilla JavaScript** for maximum compatibility and performance
- **CSS Grid & Flexbox** for modern, responsive layouts
- **Font Awesome** for beautiful, consistent icons
- **Modern Web APIs** for enhanced functionality

## 🗺️ Roadmap

### 🎯 Planned Features
- [ ] **Paper Recommendations** based on search history
- [ ] **Citation Analysis** and paper relationships
- [ ] **Email Alerts** for new papers in saved searches
- [ ] **Advanced Search Syntax** with boolean operators
- [ ] **Reference Manager Integration** (Zotero, Mendeley)
- [ ] **Collaboration Features** for research teams
- [ ] **Paper Annotations** and note-taking
- [ ] **Multiple Language Support**

### ⚡ Technical Improvements
- [ ] **Progressive Web App (PWA)** with offline support
- [ ] **Service Worker** for background sync
- [ ] **Advanced Caching** strategies
- [ ] **Performance Monitoring** and analytics
- [ ] **Automated Testing** suite
- [ ] **Docker containerization**

## 💬 Support & Community

### 🆘 Getting Help
1. **Check this README** for comprehensive documentation
2. **Search [GitHub Issues](https://github.com/your-username/paper-search-tool/issues)** for existing solutions
3. **Create a new issue** with detailed information
4. **Join community discussions** for tips and tricks

### 🐞 Reporting Bugs
Please include:
- Browser name and version
- Operating system
- Steps to reproduce the issue
- Expected vs actual behavior
- Console errors (F12 → Console)
- Screenshots if helpful

### 💡 Feature Requests
Submit via GitHub Issues with:
- Clear feature description
- Use case and research benefits
- Mockups or examples
- Implementation suggestions

---

## 🌟 Star History

If this tool helps your research, please consider giving it a star on GitHub! ⭐

Built with ❤️ for the global research community.

**Happy Researching! 📚🔬✨** 