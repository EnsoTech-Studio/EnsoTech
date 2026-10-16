import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import type { ReactNode } from 'react';
import '../index.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enso.io.vn';
const siteDescription =
  'Tư vấn roadmap và xây phần mềm theo yêu cầu: audit bảo mật, dashboard dữ liệu, AI/Agentic AI. Gửi quy trình để nhận hướng triển khai rõ ràng.';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EnsoTech Studio | Phần mềm theo yêu cầu, Security Audit & AI Agent',
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
    title: 'EnsoTech Studio | Phần mềm theo yêu cầu, Security Audit & AI Agent',
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
    title: 'EnsoTech Studio | Phần mềm theo yêu cầu, Security Audit & AI Agent',
    description: siteDescription,
    images: ['/assets/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/assets/favicon-logo-notext-rounded.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' }],
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
