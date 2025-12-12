// src/app/book/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookByIdIsbndb } from '@/lib/books/isbndb';
import { SiteHeader } from '@/app/_components/site-header';
import { BookHeroClient } from './book-hero.client';
import { getBookTheme } from '@/lib/books/theme';
import { getMoodTags } from '@/lib/books/vibes';

type PageProps = {
  // Next 15+ style: params is a Promise
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const book = await getBookByIdIsbndb(decodedId);

  if (!book) {
    return {
      title: 'Book not found | Curated Reads',
    };
  }

  return {
    title: `${book.title} | Curated Reads`,
    description: book.description ?? undefined,
  };
}

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const book = await getBookByIdIsbndb(decodedId);

  if (!book) {
    notFound();
  }

  const theme = getBookTheme(book);
  const moodTags = getMoodTags(book);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <SiteHeader />

        <Link
          href="/discover"
          className="mt-2 inline-flex text-sm text-stone-400 hover:text-stone-100"
        >
          ← Back to Discover
        </Link>

        {/* Hero card with blurred cover + themed gradient */}
        <BookHeroClient
          book={book}
          initialTheme={theme}
          moodTags={moodTags}
        />

        {/* Description below the hero */}
        {book.description && (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-300 md:text-base">
              {book.description}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
