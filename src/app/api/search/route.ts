// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { searchBooksIsbndb } from '@/lib/books/isbndb';
import type { Book } from '@/lib/books/types';

// -----------------------------------------------------------------------------
// Lightweight in-memory cache + in-flight dedupe
// NOTE:
// - This helps a lot in dev and on long-lived server instances.
// - In serverless, cache may reset between cold starts, but still reduces
//   repeated calls within the same warm instance and prevents stampedes.
// - For true cross-instance caching, you’ll eventually want KV/Redis.
// -----------------------------------------------------------------------------

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const MAX_CACHE_ENTRIES = 500;

const cache = new Map<string, { expires: number; books: Book[] }>();
const inflight = new Map<string, Promise<Book[]>>();

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

function getCached(key: string): Book[] | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }

  return entry.books;
}

function setCached(key: string, books: Book[]) {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, books });

  // simple size cap (remove oldest)
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    );
  }

  const raw = q.trim();
  const key = normalizeQuery(raw);

  // 1) Serve from cache if available
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json({ books: cached });
  }

  // 2) Deduplicate concurrent identical searches
  const existing = inflight.get(key);
  if (existing) {
    try {
      const books = await existing;
      return NextResponse.json({ books });
    } catch (err) {
      inflight.delete(key);
      console.error(err);
      return NextResponse.json(
        { error: 'Failed to search books' },
        { status: 500 }
      );
    }
  }

  // 3) Launch search and store promise in-flight
  const promise = (async () => {
    const books = await searchBooksIsbndb(raw);
    setCached(key, books ?? []);
    return books ?? [];
  })();

  inflight.set(key, promise);

  try {
    const books = await promise;
    return NextResponse.json({ books });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  } finally {
    inflight.delete(key);
  }
}
