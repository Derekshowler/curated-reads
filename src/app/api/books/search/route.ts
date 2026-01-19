// src/app/api/books/search/route.ts
import { NextResponse } from "next/server";
import { searchBooksIsbndb } from "@/lib/books/isbndb";
import type { Book } from "@/lib/books/types";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const MAX_CACHE_ENTRIES = 500;

// How many “cleaned” results we’ll keep per query for pagination.
// (If a query matches 1000 books, we’re intentionally only keeping the top N for now.)
const MAX_POOL_RESULTS = 200;

// Cache stores the whole cleaned pool for a query (not a single page)
const cache = new Map<string, { expires: number; pool: Book[] }>();
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

  return entry.pool;
}

function setCached(key: string, pool: Book[]) {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, pool });

  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

// -------------------------
// Result cleanup helpers
// -------------------------

function normText(s?: string | null) {
  return (s ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function primaryAuthor(authors?: string[] | string | null) {
  if (!authors) return "";
  if (Array.isArray(authors)) return (authors[0] ?? "").trim();
  return authors.split(",")[0]?.trim() ?? "";
}

function safeYear(y?: string | number | null) {
  const n =
    typeof y === "number" ? y : typeof y === "string" ? parseInt(y, 10) : NaN;
  if (!Number.isFinite(n)) return null;
  if (n < 1400 || n > new Date().getFullYear() + 1) return null;
  return n;
}

function scoreBook(book: Book, rawQuery: string) {
  const q = normText(rawQuery);
  const title = normText(book.title);
  const author = normText(primaryAuthor((book as any).authors ?? (book as any).author ?? ""));

  let score = 0;

  if (title === q) score += 100;
  if (title.startsWith(q)) score += 60;
  if (title.includes(q)) score += 30;

  const qParts = q.split(" ");
  if (author && qParts.some((p) => p.length >= 4 && author.includes(p))) score += 20;

  if ((book as any).coverImageUrl) score += 25;
  if ((book as any).id || (book as any).bookId || (book as any).isbn) score += 10;

  const yr = safeYear((book as any).publishedYear);
  if (yr) score += 5;

  if (book.title && book.title[0] === book.title[0].toUpperCase()) score += 2;

  return score;
}

function dedupeAndRank(raw: Book[], rawQuery: string) {
  const groups = new Map<string, { best: Book; bestScore: number }>();

  for (const b of raw) {
    const titleKey = normText(b.title);
    const authorKey = normText(primaryAuthor((b as any).authors ?? (b as any).author ?? ""));
    const key = `${titleKey}__${authorKey}`;

    if (!titleKey) continue;

    const s = scoreBook(b, rawQuery);
    const existing = groups.get(key);
    if (!existing || s > existing.bestScore) {
      groups.set(key, { best: b, bestScore: s });
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.bestScore - a.bestScore)
    .map((x) => x.best);
}

function parseIntParam(v: string | null, fallback: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q");
  const page = Math.max(1, parseIntParam(searchParams.get("page"), 1));
  const limit = Math.min(50, Math.max(1, parseIntParam(searchParams.get("limit"), 24)));

  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"', results: [], page, limit, total: 0, hasMore: false },
      { status: 400 }
    );
  }

  const rawQuery = q.trim();
  const key = normalizeQuery(rawQuery);

  // 1) Grab pool from cache (pool = cleaned results for this query)
  let pool = getCached(key);

  // 2) Build pool if needed (inflight-deduped)
  if (!pool) {
    const existing = inflight.get(key);
    if (existing) {
      pool = await existing;
    } else {
      const promise = (async () => {
        const raw = (await searchBooksIsbndb(rawQuery)) ?? [];
        const cleanedPool = dedupeAndRank(raw, rawQuery).slice(0, MAX_POOL_RESULTS);
        setCached(key, cleanedPool);
        return cleanedPool;
      })();

      inflight.set(key, promise);
      try {
        pool = await promise;
      } finally {
        inflight.delete(key);
      }
    }
  }

  // 3) Paginate from pool
  const total = pool.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const results = pool.slice(start, end);
  const hasMore = end < total;

  return NextResponse.json({
    results,
    page,
    limit,
    total,
    hasMore,
  });
}
