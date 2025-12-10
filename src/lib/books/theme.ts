// src/lib/books/theme.ts
import type { Book } from './types';

export type BookTheme = {
  // main background for the hero
  heroBgFrom: string;
  heroBgTo: string;
  // chips + accents
  accent: string;
  chipBg: string;
  chipText: string;
};

const DEFAULT_THEME: BookTheme = {
  heroBgFrom: '#020617',  // near-stone-950
  heroBgTo: '#020617',
  accent: '#facc15',      // amber-ish
  chipBg: 'rgba(15,23,42,0.9)',
  chipText: '#e5e7eb',
};

export function getBookTheme(book: Book): BookTheme {
  const t = { ...DEFAULT_THEME };

  const title = book.title.toLowerCase();

  // Example: The Will of the Many – deep blue + copper
  if (title.includes('will of the many')) {
    return {
      heroBgFrom: '#050816', // very deep navy
      heroBgTo: '#0f172a',   // slate/blue
      accent: '#f5b26b',     // copper/gold
      chipBg: 'rgba(15,23,42,0.95)',
      chipText: '#e5e7eb',
    };
  }

  // Add other specific books/themes later here

  return t;
}
