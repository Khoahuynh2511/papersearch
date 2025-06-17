import { qrCodeGenerator } from '@/utils/QRCodeGenerator';
import { QrGenerateRequest, QrGenerateResponse } from '@/utils/service';
import { NextRequest } from 'next/server';
import { nanoid } from '@/utils/utils';

/**
 * Validates a request object.
 *
 * @param {QrGenerateRequest} request - The request object to be validated.
 * @throws {Error} Error message if URL or prompt is missing.
 */

const validateRequest = (request: QrGenerateRequest) => {
  if (!request.url) {
    throw new Error('URL is required');
  }
  if (!request.prompt) {
    throw new Error('Prompt is required');
  }
};

// const ratelimit = new Ratelimit({
//   redis: kv,
//   // Allow 20 requests from the same IP in 1 day.
//   limiter: Ratelimit.slidingWindow(20, '1 d'),
// });

export async function POST(request: NextRequest) {
  const reqBody = (await request.json()) as QrGenerateRequest;

  // const ip = request.ip ?? '127.0.0.1';
  // const { success } = await ratelimit.limit(ip);

  // if (!success && process.env.NODE_ENV !== 'development') {
  //   return new Response('Too many requests. Please try again after 24h.', {
  //     status: 429,
  //   });
  // }

  try {
    validateRequest(reqBody);
  } catch (e) {
    if (e instanceof Error) {
      return new Response(e.message, { status: 400 });
    }
  }

  const id = nanoid();
  const startTime = performance.now();

  // Generate QR code using standard library instead of AI
  const dataUrl = await qrCodeGenerator.generateQrCode({
    url: reqBody.url,
    customization: {
      logoSize: 20,
      cornerStyle: 'rounded',
      colorScheme: {
        foreground: '#000000',
        background: '#FFFFFF',
      },
      pattern: 'square',
      errorCorrection: 'M',
    }
  });

  const endTime = performance.now();
  const durationMS = endTime - startTime;

  // Trả về data URL trực tiếp - không cần lưu trữ
  const response: QrGenerateResponse = {
    image_url: dataUrl,
    model_latency_ms: Math.round(durationMS),
    id: id,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
  });
}
