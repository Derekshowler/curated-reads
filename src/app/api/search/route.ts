// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { searchBooksIsbndb } from '@/lib/books/isbndb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    );
  }

  try {
    const books = await searchBooksIsbndb(q.trim());
    return NextResponse.json({ books });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
