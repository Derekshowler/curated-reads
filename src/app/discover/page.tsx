// src/app/discover/page.tsx
import { Suspense } from 'react';
import { DiscoverPageClient } from './discover-page-client';

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-stone-950 text-stone-50">
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
            <div className="mt-10 text-sm text-stone-400">Loading search…</div>
          </div>
        </main>
      }
    >
      <DiscoverPageClient />
    </Suspense>
  );
}
