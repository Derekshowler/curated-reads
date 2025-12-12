// src/lib/books/vibes.ts
import type { Book } from './types';

export type MoodTag =
  | 'cozy'
  | 'fast-paced'
  | 'slow-burn'
  | 'epic-fantasy'
  | 'cozy-mystery'
  | 'book-club-bait'
  | 'comfort-read'
  | 'big-feelings'
  | 'twisty'
  | 'dark'
  | 'hopeful'
  | 'brainy'
  | 'quiet-evening'
  | 'weekend-binge'
  | 'curated-pick'
  | 'chunky-read';

function normalize(str: string | null | undefined) {
  return (str ?? '').toLowerCase();
}

// Optional: manual overrides for edge cases (by ISBN or id)
const MANUAL_MOODS: Record<string, MoodTag[]> = {
  // Example:
  // '9781984880994': ['cozy-mystery', 'comfort-read', 'quiet-evening', 'book-club-bait'],
};

function getManualMoods(book: Book): MoodTag[] {
  const anyBook = book as any;
  const key: string | undefined =
    anyBook.isbn13 ?? anyBook.isbn10 ?? anyBook.isbn ?? anyBook.id;

  if (!key) return [];
  return MANUAL_MOODS[key] ?? [];
}

function inferMoodsFromMetadata(book: Book): MoodTag[] {
  const tags = new Set<MoodTag>();

  const title = normalize(book.title);
  const anyBook = book as any;
  const description = normalize(anyBook.description);
  const subjectsRaw =
    (anyBook.subjects as string[] | undefined) ??
    (anyBook.categories as string[] | undefined) ??
    (anyBook.genres as string[] | undefined) ??
    [];
  const subjects = subjectsRaw.map((s) => s.toLowerCase()).join(' | ');

  // Length / reading context
  if (book.pageCount && book.pageCount > 550) {
    tags.add('chunky-read');
    tags.add('weekend-binge');
  } else if (book.pageCount && book.pageCount < 320) {
    tags.add('quiet-evening');
  }

  // Genre-ish
  if (subjects.includes('fantasy') || title.includes('mistborn')) {
    tags.add('epic-fantasy');
  }

  if (
    subjects.includes('mystery') ||
    title.includes('murder club') ||
    description.includes('whodunit')
  ) {
    tags.add('cozy-mystery');
  }

  if (subjects.includes('romance') || description.includes('rom-com')) {
    tags.add('comfort-read');
  }

  // Tone from description keywords
  if (
    description.includes('heartwarming') ||
    description.includes('uplifting') ||
    description.includes('feel-good')
  ) {
    tags.add('hopeful');
    tags.add('comfort-read');
  }

  if (
    description.includes('dark') ||
    description.includes('macabre') ||
    description.includes('gritty')
  ) {
    tags.add('dark');
  }

  if (
    description.includes('twist') ||
    description.includes('twisty') ||
    description.includes('shock ending')
  ) {
    tags.add('twisty');
  }

  if (
    subjects.includes('literary') ||
    description.includes('book club') ||
    description.includes('multi-generational') ||
    description.includes('family saga')
  ) {
    tags.add('book-club-bait');
    tags.add('big-feelings');
  }

  // Nerdier non-fiction, etc.
  if (
    subjects.includes('science') ||
    subjects.includes('philosophy') ||
    subjects.includes('history')
  ) {
    tags.add('brainy');
  }

  return Array.from(tags);
}

export function getMoodTags(book: Book): MoodTag[] {
  const manual = getManualMoods(book);
  const inferred = inferMoodsFromMetadata(book);

  const merged = Array.from(new Set([...manual, ...inferred]));

  if (merged.length === 0) {
    return ['curated-pick'];
  }

  // keep it readable: top 3–4 vibes max
  return merged.slice(0, 4);
}
