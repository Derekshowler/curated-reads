// src/lib/lists/types.ts

export type ListVisibility = 'private' | 'unlisted' | 'public';

export interface ListBook {
  id: string;
  title: string;
  authors: string[];
  coverImageUrl?: string | null;
  publishedYear?: string | number | null;
}

export interface BookList {
  id: string;
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
  visibility: ListVisibility;

  bookIds: string[];
  books: ListBook[];

  createdAt: string;
  updatedAt: string;
}
