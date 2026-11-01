import type { Metadata, Viewport } from 'next';
import { Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import { AskAIFab } from '@/components/layout/AskAIFab';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lumière — GenAI Event Planner',
  description:
    'Plan weddings, milestone birthdays, and community gatherings with AI precision. Budgets, timelines, vendors, and RSVPs in minutes.',
  applicationName: 'Lumière',
  authors: [{ name: 'Lumière' }],
  keywords: ['event planner', 'wedding planner', 'birthday planner', 'AI event planner', 'celebration planner', 'budget planner'],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Lumière — GenAI Event Planner',
    description: 'Plan any celebration, beautifully.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fff8f3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-surface text-on-surface font-sans antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-primary">
        <Providers>
          {/* Accessible Skip Link for Screen Readers & Keyboard Navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-on-primary focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-container font-sans text-xs font-semibold"
          >
            Skip to main content
          </a>
          <TopNav />
          <main id="main-content" tabIndex={-1} className="flex-1 w-full pt-20 pb-32 focus:outline-none">
            {children}
          </main>
          <AskAIFab />
          <BottomTabBar />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
