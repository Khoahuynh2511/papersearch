import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import PlausibleProvider from 'next-plausible';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
  loading: () => (
    <header className="relative">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-8 py-3 px-4 max-w-screen-xl mx-auto md:px-8">
          <div className="flex-none lg:flex-initial">
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              VietQR
            </span>
          </div>
        </div>
      </nav>
    </header>
  )
});

const inter = Inter({ subsets: ['latin'] });

let title = 'VietQR - Tạo QR Code miễn phí';
let description = 'Tạo QR Code đẹp mắt và có thể tùy chỉnh trong vài giây, hoàn toàn miễn phí';
let url = 'https://www.vietqr.io';
let ogimage = 'https://www.vietqr.io/og-image.png';
let sitename = 'VietQR.io';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <PlausibleProvider domain="vietqr.io" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
