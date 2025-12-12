import type { Book } from '@/lib/books/types';

type PickOptions = {
  targetTitle?: string;
  targetAuthor?: string;
  requireCover?: boolean;
};

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
  ];
  return bad.some((k) => t.includes(k));
}

function titleMatchScore(bookTitle: string, targetTitle?: string) {
  if (!targetTitle) return 0;

  const bt = normalize(bookTitle);
  const tt = normalize(targetTitle);

  if (bt === tt) return 40;
  if (bt.startsWith(tt)) return 28;
  if (bt.includes(tt)) return 18;

  // Light token overlap scoring
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

function yearScore(year?: number | null) {
  if (!year) return 0;

  // Prefer plausible original-ish years over weird super-recent reprints
  // Soft bump for 1990–2023
  if (year >= 1990 && year <= 2023) return 4;
  return 1;
}

export function rankBooksForCuration(
  books: Book[],
  opts: PickOptions = {}
) {
  const { targetTitle, targetAuthor, requireCover } = opts;

  const scored = books.map((b) => {
    let score = 0;

    const hasCover = !!b.coverImageUrl;

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

    if (isLikelySummaryOrDerivative(b.title ?? '')) score -= 40;

    if (requireCover && !hasCover) score -= 1000;

    return { book: b, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.book);
}

export function pickBestBookForCuration(
  books: Book[],
  opts: PickOptions = {}
) {
  const ranked = rankBooksForCuration(books, opts);
  return ranked[0] ?? null;
}
