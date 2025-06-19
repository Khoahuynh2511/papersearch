import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tạo QR Code - VietQR',
  description: 'Tạo QR Code tùy chỉnh với VietQR - Nhanh chóng, miễn phí và dễ sử dụng'
};

// Lazy load với optimizations
const DynamicBody = dynamic(() => import('@/components/Body'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
  // SSR enabled cho better SEO
});

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DynamicBody />
      </div>
    </div>
  );
}
