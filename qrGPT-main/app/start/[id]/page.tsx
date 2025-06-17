import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = `VietQR - QR Code Generator`;
  const description = `Tạo QR code miễn phí với VietQR`;
  const image = 'https://vietqr.io/og-image.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@nutlope',
    },
  };
}

export default async function Results() {
  // Redirect về trang chủ vì không cần lưu trữ
  redirect('/');
}
