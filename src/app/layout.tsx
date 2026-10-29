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
  title: 'Soirée — GenAI Event Planner',
  description:
    'Plan weddings, milestone birthdays, and community gatherings with AI precision. Budgets, timelines, vendors, and RSVPs in minutes.',
  applicationName: 'Soirée',
  authors: [{ name: 'Soirée' }],
  keywords: ['event planner', 'wedding planner', 'birthday planner', 'AI event planner', 'celebration planner', 'budget planner'],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Soirée — GenAI Event Planner',
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
          <TopNav />
          <main className="flex-1 w-full pt-20 pb-32">
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
