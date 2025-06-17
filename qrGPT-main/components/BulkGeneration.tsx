'use client';

import { useState, useCallback, useRef } from 'react';
import { BulkGenerationRequest, BulkGenerationResponse } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import downloadQrCode from '@/utils/downloadQrCode';

interface BulkGenerationProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const BulkGeneration: React.FC<BulkGenerationProps> = ({ isPremium, onUpgrade }) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if present
      const urlList = lines
        .slice(lines[0].toLowerCase().includes('url') ? 1 : 0)
        .map(line => line.split(',')[0].trim())
        .filter(url => url && isValidUrl(url));
        
      setUrls(urlList);
    };
    reader.readAsText(file);
  }, []);

  const handleManualInput = useCallback((value: string) => {
    const urlList = value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && isValidUrl(url));
    setUrls(urlList);
  }, []);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleBulkGeneration = useCallback(async () => {
    if (urls.length === 0) {
      setError('Vui lòng nhập ít nhất 1 URL');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const request: BulkGenerationRequest = {
        urls,
        customization: {
          logoSize: 20,
          cornerStyle: 'rounded',
          colorScheme: {
            foreground: '#000000',
            background: '#FFFFFF',
          },
          pattern: 'square',
          errorCorrection: 'M',
        },
        format: 'png',
      };

      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Bulk generation failed');
      }

      const data: BulkGenerationResponse = await response.json();
      
      // Không cần polling nữa vì API trả về kết quả ngay
      setProgress(100);
      setResults(data);
      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsProcessing(false);
    }
  }, [urls]);

  const downloadCSVTemplate = useCallback(() => {
    const csvContent = 'URL,Description\nhttps://example1.com,Website 1\nhttps://example2.com,Website 2';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadSingleQR = useCallback((imageUrl: string, filename: string) => {
    console.log('Downloading single QR:', { imageUrl, filename });
    downloadQrCode(imageUrl, filename);
  }, []);

  const downloadAllQRs = useCallback(() => {
    if (!results) {
      console.log('No results to download');
      return;
    }
    
    console.log('Downloading all QRs:', results.results.length, 'items');
    
    // Tải từng QR code với delay để tránh browser block
    results.results.forEach((result: any, index: number) => {
      setTimeout(() => {
        const filename = `qr-code-${index + 1}.png`;
        console.log(`Downloading QR ${index + 1}:`, { url: result.image_url, filename });
        downloadQrCode(result.image_url, filename);
      }, index * 300); // Tăng delay lên 300ms để ổn định hơn
    });
  }, [results]);

  const downloadAsZip = useCallback(async () => {
    if (!results) return;
    
    try {
      // Import JSZip dynamically để giảm bundle size
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      console.log('Creating ZIP with', results.results.length, 'QR codes');
      
      // Add all QR codes to ZIP
      for (let i = 0; i < results.results.length; i++) {
        const result = results.results[i];
        const filename = `qr-code-${i + 1}.png`;
        
        try {
          // Convert data URL to blob
          const response = await fetch(result.image_url);
          const blob = await response.blob();
          zip.file(filename, blob);
        } catch (error) {
          console.error(`Failed to add ${filename} to ZIP:`, error);
        }
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-codes-bulk-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('ZIP download completed');
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      alert('Không thể tạo file ZIP. Vui lòng thử "Tải tất cả" thay thế.');
    }
  }, [results]);

  if (!isPremium) {
    return (
      <div className="p-8 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Upload className="mx-auto h-16 w-16 text-purple-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Bulk Generation
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tạo hàng trăm QR code cùng lúc từ file CSV. Tiết kiệm thời gian và tăng hiệu quả làm việc.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Upload CSV file
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Batch processing
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Download ZIP
            </div>
          </div>
          <Button 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Nâng cấp để sử dụng Bulk Generation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
          Tạo QR Code hàng loạt
        </h2>
        <p className="text-gray-600">Tạo nhiều QR code cùng lúc từ danh sách URLs một cách dễ dàng</p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URL Input */}
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold">Nhập URLs</Label>
            <p className="text-gray-600 text-sm mb-4">
              Upload file CSV hoặc nhập thủ công (mỗi URL một dòng)
            </p>
            
            {/* CSV Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
              >
                Upload CSV File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                <button
                  onClick={downloadCSVTemplate}
                  className="text-blue-600 hover:underline"
                >
                  Tải template CSV
                </button>
              </p>
            </div>

            {/* Manual Input */}
            <div className="mt-4">
              <Label>Hoặc nhập thủ công:</Label>
              <Textarea
                placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                rows={6}
                onChange={(e) => handleManualInput(e.target.value)}
                className="mt-2"
              />
            </div>

            {urls.length > 0 && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Đã tải {urls.length} URLs hợp lệ
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* QR Settings */}
          <div>
            <Label className="text-lg font-semibold">
              Cài đặt QR Code
            </Label>
            <p className="text-gray-600 text-sm mb-2">
              QR code sẽ được tạo với thiết kế tiêu chuẩn
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Màu nền: Trắng</div>
                <div>Màu mã: Đen</div>
                <div>Độ phân giải: 512px</div>
                <div>Định dạng: PNG</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Settings */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Cài đặt</h3>
            <div className="space-y-4">
              <div>
                <Label>Định dạng xuất</Label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option value="png">PNG (Recommended)</option>
                  <option value="svg">SVG (Vector)</option>
                  <option value="pdf">PDF (Print Ready)</option>
                </select>
              </div>
              <div>
                <Label>Chất lượng</Label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option value="standard">Standard (Fast)</option>
                  <option value="high">High Quality</option>
                  <option value="ultra">Ultra High (Slow)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          {urls.length > 0 && (
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="space-y-2 text-sm">
                <p><strong>URLs:</strong> {urls.length} items</p>
                <p><strong>Style:</strong> Thiết kế chuẩn (Đen/Trắng)</p>
                <p><strong>Thời gian ước tính:</strong> ~{urls.length * 2} giây</p>
                <p><strong>Chi phí:</strong> Miễn phí</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={handleBulkGeneration}
          disabled={isProcessing || urls.length === 0}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
        >
          {isProcessing ? (
            <>
              <LoadingDots />
              <span className="ml-2">Đang xử lý...</span>
            </>
          ) : (
            `Tạo ${urls.length} QR Codes`
          )}
        </Button>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tiến độ xử lý</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Đang tạo QR codes... Vui lòng không tắt trang này.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results && results.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              Hoàn thành!
            </h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-green-800">
              Đã tạo thành công {results.results.length} QR codes
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => downloadAllQRs()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải tất cả
              </Button>
              <Button
                onClick={() => downloadAsZip()}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải ZIP
              </Button>
            </div>
          </div>
          
          {/* Individual Downloads */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.results.map((result: any, index: number) => (
              <div key={result.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    QR Code #{index + 1}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.originalUrl}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => downloadSingleQR(result.image_url, `qr-code-${index + 1}.png`)}
                  className="ml-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Tải
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-600 mt-3">
            💡 Tip: Bấm "Tải tất cả" để tải hết hoặc bấm "Tải" cho từng QR code riêng lẻ
          </p>
        </div>
      )}
    </div>
  );
};

export default BulkGeneration; 