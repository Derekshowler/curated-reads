// src/app/page.tsx
import Link from 'next/link';
import { SiteHeader } from './_components/site-header';
import {
  HOME_SHELVES,
  type ShelfSection,
  type ShelfItem,
} from '@/lib/curation/shelves';
import type { Book } from '@/lib/books/types';
import { headers } from 'next/headers';
import { getBookByIdIsbndb } from '@/lib/books/isbndb';

type ShelfWithBooks = {
  shelf: ShelfSection;
  books: Book[];
};

async function getBaseUrlFromHeaders() {
  const h = await headers();

  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';

  return host ? `${proto}://${host}` : 'http://localhost:3000';
}

// -----------------------------------------------------------------------------
// Curated "best edition" ranking helpers
// -----------------------------------------------------------------------------

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelySummaryOrDerivative(title: string) {
  const t = normalize(title);
  const bad = [
    'summary',
    'workbook',
    'study guide',
    'analysis',
    'companion',
    'notes',
    'quick guide',
    'review',
    'book club kit',
    'journal',
    'box set',
  ];
  return bad.some((k) => t.includes(k));
}

function titleMatchScore(bookTitle: string, targetTitle?: string) {
  if (!targetTitle) return 0;

  const bt = normalize(bookTitle);
  const tt = normalize(targetTitle);

  if (!bt || !tt) return 0;

  if (bt === tt) return 40;
  if (bt.startsWith(tt)) return 28;
  if (bt.includes(tt)) return 18;

  // light token overlap scoring
  const bTokens = new Set(bt.split(' '));
  const tTokens = tt.split(' ');

  let hit = 0;
  for (const tok of tTokens) if (bTokens.has(tok)) hit++;

  const ratio = tTokens.length ? hit / tTokens.length : 0;
  if (ratio >= 0.8) return 14;
  if (ratio >= 0.6) return 8;
  return 0;
}

function authorMatchScore(book: Book, targetAuthor?: string) {
  if (!targetAuthor) return 0;

  const ta = normalize(targetAuthor);
  const authors = (book.authors ?? []).map(normalize);

  if (authors.some((a) => a === ta)) return 25;
  if (authors.some((a) => a.includes(ta) || ta.includes(a))) return 14;

  return 0;
}

function yearScore(year?: number | string | null) {
  if (year == null) return 0;

  const n =
    typeof year === 'string'
      ? Number.parseInt(year, 10)
      : year;

  if (!Number.isFinite(n)) return 0;

  // soft preference for plausible original-ish years over odd reprints
  if (n >= 1990 && n <= 2024) return 4;
  return 1;
}

function rankBooksForCuration(
  books: Book[],
  opts: {
    targetTitle?: string;
    targetAuthor?: string;
    requireCover?: boolean;
  } = {}
) {
  const { targetTitle, targetAuthor, requireCover } = opts;

  const scored = books.map((b) => {
    let score = 0;

    const hasCover = !!b.coverImageUrl;

    // Cover priority for curated shelves
    if (hasCover) score += 12;
    else score -= 8;

    score += titleMatchScore(b.title ?? '', targetTitle);
    score += authorMatchScore(b, targetAuthor);
    const publishedYear =
      typeof b.publishedYear === 'string'
        ? parseInt(b.publishedYear, 10)
        : b.publishedYear ?? undefined;

    score += yearScore(
      Number.isNaN(publishedYear as number) ? undefined : (publishedYear as number | undefined)
    );

    // Hard penalty for derivative junk
    if (isLikelySummaryOrDerivative(b.title ?? '')) score -= 40;

    // If we require a cover, demote coverless heavily
    if (requireCover && !hasCover) score -= 1000;

    return { book: b, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.book);
}

// -----------------------------------------------------------------------------
// Search + pick best match for curated shelves
// -----------------------------------------------------------------------------

async function searchBestCuratedBook(
  baseUrl: string,
  item: ShelfItem
): Promise<Book | null> {
  // ✅ Hard override path via ISBN
  if (item.isbn) {
    try {
      const byIsbn = await getBookByIdIsbndb(item.isbn);
      if (byIsbn?.coverImageUrl) return byIsbn;
      // If ISBN resolves but still no cover, fall through to search
    } catch (err) {
      console.error('ISBN fetch error:', item.isbn, err);
      // fall through to search
    }
  }

  const query = `${item.title} ${item.author}`.trim();
  if (!query) return null;

  try {
    const res = await fetch(
      `${baseUrl}/api/search?q=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const books = (data?.books ?? []) as Book[];

    if (books.length === 0) return null;

    const ranked = rankBooksForCuration(books, {
      targetTitle: item.title,
      targetAuthor: item.author,
      requireCover: true,
    });

    return ranked[0] ?? null;
  } catch (err) {
    console.error('Search error for query:', query, err);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Build homepage shelves
// -----------------------------------------------------------------------------

async function getHomeShelves(): Promise<ShelfWithBooks[]> {
  const baseUrl = await getBaseUrlFromHeaders();

  const shelves = await Promise.all(
    HOME_SHELVES.map(async (shelf) => {
      const limit = shelf.limit ?? shelf.items.length;

      const resolved = await Promise.all(
        shelf.items.slice(0, limit).map((item) =>
          searchBestCuratedBook(baseUrl, item)
        )
      );

      // Strictly keep only books with covers for curated homepage
      const books = resolved.filter(
        (b): b is Book => Boolean(b && b.coverImageUrl)
      );

      return { shelf, books };
    })
  );

  return shelves.filter((entry) => entry.books.length > 0);
}

// -----------------------------------------------------------------------------
// Daily-random helper for "Tonight's stack"
// -----------------------------------------------------------------------------

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let s = seed;

  const rand = () => {
    // Simple deterministic LCG
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function HomePage() {
  const shelves = await getHomeShelves();

  // Collect all books with covers as candidates for the hero preview
  const allHeroCandidates = shelves.flatMap((s) =>
    s.books.filter((b) => !!b.coverImageUrl)
  );

  let heroStack: Book[] = [];
  if (allHeroCandidates.length > 0) {
    // UTC YYYYMMDD seed → stable per day, different across days
    const now = new Date();
    const seed =
      now.getUTCFullYear() * 10000 +
      (now.getUTCMonth() + 1) * 100 +
      now.getUTCDate();

    heroStack = seededShuffle(allHeroCandidates, seed).slice(0, 3);
  }

  return (
    <main className="bg-stone-950 text-stone-50">
      {/* Soft global background glow */}
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.04),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.8),_transparent_55%)]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <SiteHeader />

          {/* Hero */}
          <section className="mt-8 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
                Curated Reads
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Premium book recommendations,
                <br className="hidden md:block" />
                without the endless scroll.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-stone-300 md:text-base">
                Browse curated shelves by vibe, genre, and season. No login
                required — just beautifully organized stacks of books
                you&apos;ll actually want to read.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <Link
                  href="#cozy-comfort"
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 font-medium text-stone-950 hover:bg-amber-400"
                >
                  Start with cozy picks
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center rounded-full border border-stone-700 bg-stone-900/70 px-5 py-2 text-stone-100 hover:border-amber-400/70 hover:text-amber-100"
                >
                  Search all books
                </Link>
              </div>

              <p className="mt-3 text-xs text-stone-500">
                Coming soon: save favorites, build your own shelves, and get
                personalized vibes.
              </p>
            </div>

            {/* “Tonight's stack” preview on the right */}
            <div className="hidden gap-3 md:flex md:flex-col">
              <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.8)]">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                  Tonight&apos;s stack
                </p>
                <p className="mt-2 text-sm text-stone-200">
                  A few hand-picked reads that feel right for a quiet evening.
                </p>

                <div className="mt-4 flex gap-3">
                  {heroStack.length > 0 ? (
                    heroStack.map((book) => (
                      <Link
                        key={book.id}
                        href={`/book/${encodeURIComponent(book.id)}`}
                        className="group"
                      >
                        <img
                          src={book.coverImageUrl!}
                          alt={book.title}
                          className="h-28 w-20 rounded-xl object-cover ring-1 ring-stone-800/80 transition-transform group-hover:-translate-y-0.5 group-hover:ring-amber-500/50"
                          loading="lazy"
                        />
                      </Link>
                    ))
                  ) : (
                    <>
                      <div className="h-28 w-20 rounded-xl bg-gradient-to-b from-stone-700 to-stone-900" />
                      <div className="h-28 w-20 rounded-xl bg-gradient-to-b from-stone-700 to-stone-900" />
                      <div className="h-28 w-20 rounded-xl bg-gradient-to-b from-stone-700 to-stone-900" />
                    </>
                  )}
                </div>

                <p className="mt-3 text-[11px] text-stone-500">
                  {heroStack.length > 0
                    ? 'Pulled from today’s featured shelves.'
                    : 'These will soon be real books, drawn from your curated shelves.'}
                </p>
              </div>
            </div>
          </section>

          {/* Shelves */}
          <section className="mt-12 space-y-10">
            {shelves.map(({ shelf, books }) => (
              <div key={shelf.key} id={shelf.key}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                      {shelf.title}
                    </h2>
                    {shelf.subtitle && (
                      <p className="mt-1 text-xs text-stone-400 md:text-sm">
                        {shelf.subtitle}
                      </p>
                    )}
                  </div>

                  {/* If you later add a `query` field back to the new shelf type,
                      this link will be easy to re-enable. */}
                </div>

                <div className="-mx-1 flex gap-3 overflow-x-auto overflow-y-visible px-1 py-2">
                  {books.map((book) => (
                    <Link
                      key={book.id}
                      href={`/book/${encodeURIComponent(book.id)}`}
                      className="min-w-[140px] max-w-[140px] flex-shrink-0 rounded-2xl border border-stone-800 bg-stone-900/70 p-2
                                 transition-transform transition-shadow transition-colors hover:-translate-y-1 hover:border-amber-500/70 hover:bg-stone-900 hover:shadow-[0_18px_45px_rgba(0,0,0,0.75)]"
                    >
                      {book.coverImageUrl && (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="h-40 w-full rounded-lg object-cover"
                        />
                      )}
                      <p className="mt-2 line-clamp-2 text-xs font-medium text-stone-50">
                        {book.title}
                      </p>
                      {book.authors.length > 0 && (
                        <p className="mt-1 line-clamp-1 text-[11px] text-stone-400">
                          {book.authors.join(', ')}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {shelves.length === 0 && (
              <p className="text-sm text-stone-400">
                We&apos;re still curating shelves behind the scenes. Try the{' '}
                <Link
                  href="/discover"
                  className="text-amber-300 underline underline-offset-2 hover:text-amber-200"
                >
                  Discover
                </Link>{' '}
                page in the meantime.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
