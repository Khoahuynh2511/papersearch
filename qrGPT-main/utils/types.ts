export type QrCodeControlNetRequest = {
  url: string;
  prompt: string;
  qr_conditioning_scale?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
};

export type QrCodeControlNetResponse = [string];

// Premium Features & Subscription Types
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  qrLimit: number;
  apiAccess: boolean;
  bulkGeneration: boolean;
  customBranding: boolean;
  analytics: boolean;
}

export interface UserSubscription {
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired';
  currentUsage: number;
  renewsAt: Date;
}

// QR Customization Types
export interface QRCustomization {
  logoFile?: File;
  logoUrl?: string;
  logoSize: number; // 10-30% of QR size
  cornerStyle: 'square' | 'rounded' | 'circle' | 'leaf';
  colorScheme: {
    foreground: string;
    background: string;
    accent?: string;
  };
  pattern: 'square' | 'circle' | 'rounded' | 'heart' | 'star';
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  frameStyle?: 'none' | 'simple' | 'rounded' | 'gradient';
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
}

// Bulk Generation Types
export interface BulkGenerationRequest {
  urls: string[];
  customization?: QRCustomization;
  format?: 'png' | 'svg' | 'pdf';
}

export interface BulkGenerationResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: QrGenerateResponse[];
  downloadUrl?: string;
}

// API Access Types
export interface ApiUsage {
  userId: string;
  requestCount: number;
  lastRequest: Date;
  monthlyLimit: number;
}

// Import QrGenerateResponse from service
import type { QrGenerateResponse } from './service';
