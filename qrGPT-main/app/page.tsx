import CTA from '@/components/CTA';
import GradientWrapper from '@/components/GradientWrapper';
import Hero from '@/components/Hero';
import FeatureHighlights from '@/components/FeatureHighlights';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VietQR - Tạo QR Code miễn phí, nhanh chóng',
  description: 'Tạo QR Code đẹp mắt trong vài giây với VietQR. Hoàn toàn miễn phí, dễ sử dụng, hỗ trợ tùy chỉnh màu sắc và logo.',
  keywords: 'QR code, tạo QR, Vietnam, miễn phí, QR generator',
  openGraph: {
    title: 'VietQR - Tạo QR Code miễn phí',
    description: 'Tạo QR Code đẹp mắt trong vài giây, hoàn toàn miễn phí',
    type: 'website',
  }
};

// Force static generation
export const dynamic = 'force-static';

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureHighlights />
      <GradientWrapper></GradientWrapper>
      <CTA />
    </>
  );
}
