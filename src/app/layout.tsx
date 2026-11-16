import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { MaterialWebLoader } from '@/components/m3/MaterialWebLoader';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { NavigationProgressBar } from '@/components/NavigationProgressBar';
import { PageTransition } from '@/components/PageTransition';
import { getCatalogData } from '@/lib/db';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const dynamic = 'force-dynamic';

const initialData = getCatalogData();
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  initialData.settings.siteUrl ||
  'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'E-Catalog — Elektron ulgurji katalog',
  description:
    'Mahsulotlarning ulgurji elektron katalogi. Ochiq narxlar va ombor qoldig‘i.',
  openGraph: {
    siteName: 'E-Catalog',
    locale: 'uz_UZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = getCatalogData();
  const { adminPin: _pin, ...publicSettings } = data.settings;

  return (
    <html lang="uz" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#f8fafd] text-[#1f1f1f] font-sans antialiased">
        <MaterialWebLoader />
        <LanguageProvider>
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          <Navbar settings={publicSettings} />
          <main className="flex-1 pb-16 sm:pb-0 flex flex-col w-full min-w-0 max-w-full overflow-x-hidden">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer settings={publicSettings} />
          <MobileBottomNav settings={publicSettings} />
        </LanguageProvider>
      </body>
    </html>
  );
}
