import { NextRequest } from 'next/server';
import { BulkGenerationRequest, BulkGenerationResponse } from '@/utils/types';
import { qrCodeGenerator } from '@/utils/QRCodeGenerator';
import { nanoid } from '@/utils/utils';

// Simulate user subscription check
const checkUserSubscription = async (userId?: string) => {
  // In real app, this would check against database
  return {
    tier: 'business', // free, pro, business, enterprise
    canUseBulkGeneration: true,
    monthlyLimit: 500,
    currentUsage: 50,
  };
};

export async function POST(request: NextRequest) {
  try {
    const reqBody = (await request.json()) as BulkGenerationRequest;

    // Validate request
    if (!reqBody.urls || reqBody.urls.length === 0) {
      return new Response('URLs array is required', { status: 400 });
    }

    // Check limits - giảm xuống 10 để tránh timeout
    if (reqBody.urls.length > 10) {
      return new Response('Maximum 10 URLs per batch', { status: 400 });
    }

    // Generate all QR codes ngay lập tức
    const results = await qrCodeGenerator.generateBulkQrCodes(
      reqBody.urls,
      {
        logoSize: 20,
        cornerStyle: 'rounded',
        colorScheme: {
          foreground: '#000000',
          background: '#FFFFFF',
        },
        pattern: 'square',
        errorCorrection: 'M',
      }
    );

    const jobId = nanoid();
    const response: BulkGenerationResponse = {
      jobId,
      status: 'completed',
      results: results.map(result => ({
        image_url: result.dataUrl,
        model_latency_ms: 50, // Giả lập latency
        id: nanoid(),
        originalUrl: result.url,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Bulk generation error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Không cần background processing nữa vì generate trực tiếp 