// src/lib/books/types.ts
export type Book = {
  id: string;                    // what we use in URLs: usually isbn13 or isbn
  title: string;
  subtitle?: string | null;
  authors: string[];
  isbn13?: string | null;
  publishedYear?: string | null;
  pageCount?: number | null;
  publisher?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  source: 'isbndb';
};

