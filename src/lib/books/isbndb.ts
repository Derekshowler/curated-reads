// src/lib/books/isbndb.ts
import type { Book } from './types';

const ISBNDB_BASE_URL = 'https://api2.isbndb.com';

interface IsbndbBook {
  title: string;
  title_long?: string;
  authors?: string[];
  isbn?: string;
  isbn13?: string;
  date_published?: string;
  pages?: number;
  publisher?: string;
  overview?: string;
  synopsys?: string;
  image?: string;
}

interface IsbndbSearchResponse {
  books?: IsbndbBook[];
  total?: number;
}

interface IsbndbBookResponse {
  book?: IsbndbBook;
}

function mapIsbndbBook(raw: IsbndbBook): Book {
  const yearMatch = raw.date_published?.match(/\d{4}/)?.[0] ?? null;

  return {
    id: raw.isbn13 ?? raw.isbn ?? raw.title,
    title: raw.title,
    subtitle: raw.title_long ?? null,
    authors: raw.authors ?? [],
    isbn13: raw.isbn13 ?? null,
    publishedYear: yearMatch,
    pageCount: raw.pages ?? null,
    publisher: raw.publisher ?? null,
    description: raw.overview ?? raw.synopsys ?? null,
    coverImageUrl: raw.image ?? null,
    source: 'isbndb',
  };
}

function getApiKey(): string {
  const apiKey = process.env.ISBNDB_API_KEY;
  if (!apiKey) {
    console.error('Missing ISBNDB_API_KEY env var');
    throw new Error('ISBNDB_API_KEY is not set');
  }
  return apiKey;
}

export async function searchBooksIsbndb(query: string): Promise<Book[]> {
  const apiKey = getApiKey();
  const url = `${ISBNDB_BASE_URL}/books/${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('ISBNdb search error', res.status, body);
    throw new Error(`ISBNdb request failed with status ${res.status}`);
  }

  const data = (await res.json()) as IsbndbSearchResponse;
  const rawBooks = data.books ?? [];
  return rawBooks.map(mapIsbndbBook);
}

export async function getBookByIdIsbndb(id: string): Promise<Book | null> {
  const apiKey = getApiKey();
  const url = `${ISBNDB_BASE_URL}/book/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const body = await res.text();
    console.error('ISBNdb book error', res.status, body);
    throw new Error(`ISBNdb book request failed with status ${res.status}`);
  }

  const data = (await res.json()) as IsbndbBookResponse;
  if (!data.book) return null;

  return mapIsbndbBook(data.book);
}

