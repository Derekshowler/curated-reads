// src/app/_components/site-header.tsx
'use client';

import Link from 'next/link';
import { AuthButton } from './auth-button';

export function SiteHeader() {
  return (
    <div className="flex items-center justify-between">
      {/* Clickable logo → homepage */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-90"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/90 text-sm font-semibold">
          CR
        </span>
        <span className="text-lg font-semibold tracking-tight">
          Curated Reads
        </span>
      </Link>

      {/* Nav + auth */}
      <nav className="flex items-center gap-4 text-sm text-stone-300">
        <Link
          href="/"
          className="rounded-full border border-stone-700 px-3 py-1 hover:border-stone-500 hover:text-stone-100"
        >
          Home
        </Link>
        <Link
          href="/discover"
          className="rounded-full border border-stone-700 px-3 py-1 hover:border-stone-500 hover:text-stone-100"
        >
          Discover
        </Link>

        <AuthButton />
      </nav>
    </div>
  );
}
