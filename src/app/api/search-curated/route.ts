import { NextResponse } from 'next/server';
import { pickBestBookForCuration, rankBooksForCuration } from '@/lib/books/pick-best-book';

// Import your existing search function or call your existing logic.
// If your current /api/search route calls an internal helper, reuse it here.
// Otherwise you can do a fetch to your own /api/search.
async function runSearch(q: string) {
  // TODO: replace with your actual search implementation
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/search?q=${encodeURIComponent(q)}`, {
    cache: 'no-store',
  });

  if (!res.ok) return { books: [] };
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') ?? '';
  const author = searchParams.get('author') ?? '';
  const requireCover = searchParams.get('requireCover') === '1';

  const q = `${title} ${author}`.trim();
  if (!q) {
    return NextResponse.json({ book: null, books: [] });
  }

  const data = await runSearch(q);
  const books = (data?.books ?? []) as any[];

  const ranked = rankBooksForCuration(books, {
    targetTitle: title,
    targetAuthor: author,
    requireCover,
  });

  const best = pickBestBookForCuration(books, {
    targetTitle: title,
    targetAuthor: author,
    requireCover,
  });

  return NextResponse.json({
    book: best,
    books: ranked, // optional: ranked list for debugging/UX
  });
}
