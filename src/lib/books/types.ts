// src/lib/books/types.ts
export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  isbn13?: string;
  publishedYear?: number;
  description?: string;
  coverImageUrl?: string;
  source: 'isbndb';
};
