import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  // Không cần job tracking nữa vì generate trực tiếp
  // Trả về completed luôn
  const response = {
    jobId: params.jobId,
    status: 'completed',
    totalUrls: 0,
    completedUrls: 0,
    results: [],
    downloadUrl: null,
    error: null,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
} 