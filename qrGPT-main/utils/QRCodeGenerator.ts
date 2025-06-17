import QRCode from 'qrcode';
import { QRCustomization } from './types';

export interface QRGenerateRequest {
  url: string;
  customization?: QRCustomization;
}

export class QRCodeGenerator {
  /**
   * Generate a simple QR code with customization options
   */
  async generateQrCode(request: QRGenerateRequest): Promise<string> {
    const { url, customization } = request;

    // QR code generation options
    const options: QRCode.QRCodeToDataURLOptions = {
      type: 'image/png' as const,
      margin: 1,
      color: {
        dark: customization?.colorScheme?.foreground || '#000000',
        light: customization?.colorScheme?.background || '#FFFFFF',
      },
      width: 512, // High resolution
      errorCorrectionLevel: this.mapErrorCorrection(customization?.errorCorrection || 'M'),
    };

    try {
      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(url, options);
      return dataUrl;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as buffer for file storage
   */
  async generateQrCodeBuffer(request: QRGenerateRequest): Promise<Buffer> {
    const { url, customization } = request;

    const options: QRCode.QRCodeToBufferOptions = {
      type: 'png' as const,
      margin: 1,
      color: {
        dark: customization?.colorScheme?.foreground || '#000000',
        light: customization?.colorScheme?.background || '#FFFFFF',
      },
      width: 512,
      errorCorrectionLevel: this.mapErrorCorrection(customization?.errorCorrection || 'M'),
    };

    try {
      const buffer = await QRCode.toBuffer(url, options);
      return buffer;
    } catch (error) {
      console.error('QR Code buffer generation failed:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }

  /**
   * Map custom error correction levels to QRCode library format
   */
  private mapErrorCorrection(level: 'L' | 'M' | 'Q' | 'H'): QRCode.QRCodeErrorCorrectionLevel {
    const mapping = {
      'L': 'low' as const,
      'M': 'medium' as const,
      'Q': 'quartile' as const,
      'H': 'high' as const,
    };
    return mapping[level];
  }

  /**
   * Generate multiple QR codes for bulk generation
   */
  async generateBulkQrCodes(urls: string[], customization?: QRCustomization): Promise<{ url: string; dataUrl: string }[]> {
    const results = [];
    
    for (const url of urls) {
      try {
        const dataUrl = await this.generateQrCode({ url, customization });
        results.push({ url, dataUrl });
      } catch (error) {
        console.error(`Failed to generate QR code for ${url}:`, error);
        // Continue with other URLs
      }
    }
    
    return results;
  }
}

// Create singleton instance
export const qrCodeGenerator = new QRCodeGenerator(); 