import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import type { ReactNode } from 'react';
import '../index.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enso.io.vn';
const siteDescription =
  'EnsoTech Studio xây phần mềm riêng, audit/nâng cấp bảo mật, dashboard dữ liệu và AI/Agentic AI cho doanh nghiệp nhỏ, chủ shop và startup.';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EnsoTech Studio | Phần mềm riêng, Security Audit, Dashboard và AI Agent',
    template: '%s | EnsoTech Studio',
  },
  description: siteDescription,
  applicationName: 'EnsoTech Studio',
  keywords: [
    'EnsoTech Studio',
    'phần mềm theo yêu cầu',
    'thiết kế phần mềm riêng',
    'security audit',
    'audit hệ thống',
    'dashboard dữ liệu',
    'AI agent',
    'Agentic AI',
    'startup phần mềm Việt Nam',
  ],
  authors: [{ name: 'EnsoTech Studio', url: siteUrl }],
  creator: 'EnsoTech Studio',
  publisher: 'EnsoTech Studio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'EnsoTech Studio',
    title: 'EnsoTech Studio | Xây hệ thống an toàn hơn, thông minh hơn',
    description: siteDescription,
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EnsoTech Studio - Software, Security Audit, Dashboard và AI Agent',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EnsoTech Studio | Software, Security Audit, Dashboard và AI Agent',
    description: siteDescription,
    images: ['/assets/og-image.png'],
  },
  icons: {
    icon: [{ url: '/assets/favicon-logo-notext-rounded.png', type: 'image/png' }],
    apple: [{ url: '/assets/favicon-logo-notext-rounded.png', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EEF6F1',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body>{children}</body>
    </html>
  );
}
