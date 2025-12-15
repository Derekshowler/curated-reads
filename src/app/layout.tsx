// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { SiteHeader } from './_components/site-header';

export const metadata: Metadata = {
  title: 'Curated Reads',
  description: 'Discover your next favorite book.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-950 text-stone-50">
        <Providers>
          {/* Global top bar */}
          <header className="border-b border-stone-800/60 bg-stone-950">
            <div className="mx-auto max-w-5xl px-6 py-4">
              <SiteHeader />
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto max-w-5xl px-6 pb-10 pt-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
