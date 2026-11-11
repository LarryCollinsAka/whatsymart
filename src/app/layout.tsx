import type { Metadata, Viewport } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'
import { CurrencyProvider } from '@/lib/currency/context'
import { Header } from '@/components/marketplace/Header'
import { MobileNav } from '@/components/marketplace/MobileNav'
import { Footer } from '@/components/marketplace/Footer'

export const metadata: Metadata = {
  title: 'WhatsyMart - Global Multi-Vendor & Dropshipping Marketplace',
  description:
    'Order fresh groceries and goods direct from verified merchants via WhatsApp. Enterprise multi-vendor platform with live exchange rates, Apple Pay, GPay, and Bank Transfer.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f4c35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900 antialiased selection:bg-amber-300 selection:text-emerald-950">
        <I18nProvider>
          <CurrencyProvider>
            <Header />
            <main className="flex-1 pb-16 sm:pb-0">{children}</main>
            <MobileNav />
            <Footer />
          </CurrencyProvider>
        </I18nProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
