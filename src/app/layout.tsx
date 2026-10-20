import './globals.css';

import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

import { FloatingControls } from '@/components/floating-controls';
import MicrosoftClarity from '@/lib/microsoft-clarity';
import PostHogScript from '@/lib/posthog-script';
import RootProvider from '@/provider/root-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hirelytics - AI Interview Platform for Modern Hiring',
  description:
    'Our AI-driven platform transforms the recruitment process from job posting to candidate selection. Automate interviews, analyze resumes, and make data-driven hiring decisions.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' }],
    apple: '/images/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#F8FAFC] text-[#0F172A]`}
      >
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap"
          rel="stylesheet"
          precedence="default"
        />
        <NextTopLoader color="#2563EB" showSpinner={false} />
        <RootProvider>
          <div className="relative flex min-h-screen flex-col">
            <FloatingControls />
            <MicrosoftClarity />
            <PostHogScript />
            <Analytics />
            <div className="flex-1">{children}</div>
          </div>
          <Toaster richColors position="top-right" />
        </RootProvider>
      </body>
    </html>
  );
}
