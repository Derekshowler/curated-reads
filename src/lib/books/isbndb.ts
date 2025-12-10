import type { Book } from './types';

const ISBNDB_BASE_URL = 'https://api2.isbndb.com';

interface IsbndbBook {
  title: string;
  authors?: string[];
  isbn?: string;
  isbn13?: string;
  date_published?: string;
  image?: string;
  // ...you can extend this as needed
}

interface IsbndbSearchResponse {
  books?: IsbndbBook[];
  total?: number;
}

export async function searchBooksIsbndb(query: string): Promise<Book[]> {
  const apiKey = process.env.ISBNDB_API_KEY;

  if (!apiKey) {
    console.error('Missing ISBNDB_API_KEY env var');
    throw new Error('ISBNDB_API_KEY is not set');
  }

  // /books/{query} → "Search books"
  const url = `${ISBNDB_BASE_URL}/books/${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: apiKey, // this is exactly what the docs want
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('ISBNdb error', res.status, body);
    throw new Error(`ISBNdb request failed with status ${res.status}`);
  }

  const data = (await res.json()) as IsbndbSearchResponse;

  const rawBooks = data.books ?? [];

  return rawBooks.map((b): Book => {
    const firstYear = b.date_published?.match(/\d{4}/)?.[0];

    return {
      id: b.isbn13 ?? b.isbn ?? b.title,
      title: b.title,
      authors: b.authors ?? [],
      publishedYear: firstYear ?? null,
      coverImageUrl: b.image ?? null,
    };
  });
}
