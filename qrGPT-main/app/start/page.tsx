import { Metadata } from 'next';
import Body from '@/components/Body';

export const metadata: Metadata = {
  title: 'Tạo QR Code - VietQR',
  description: 'Tạo QR Code tùy chỉnh với VietQR - Nhanh chóng, miễn phí và dễ sử dụng'
};

// Bỏ dynamic import để tăng khả năng SSR
export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Body />
      </div>
    </div>
  );
}
