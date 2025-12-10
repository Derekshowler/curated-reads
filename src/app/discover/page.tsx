// src/app/discover/page.tsx
'use client';

import { useState } from 'react';
import type { Book } from '@/lib/books/types';
import Link from 'next/link';
import { SiteHeader } from '@/app/_components/site-header';

export default function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }

      const data = await res.json();
      setResults(data.books ?? []);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while searching. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        {/* Header */}
        <SiteHeader active="discover" />

        {/* Search section */}
        <section>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Discover your next read
          </h1>
          <p className="mt-3 max-w-xl text-sm text-stone-300 md:text-base">
            Search across millions of books. We&apos;ll soon add vibes, moods, and
            personalized picks — for now, start exploring what&apos;s out there.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or topic"
              className="h-11 flex-1 rounded-full border border-stone-700 bg-stone-900/70 px-4 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-400"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-amber-500 px-6 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/60"
              disabled={isLoading}
            >
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* Results */}
        <section className="mt-10 flex-1">
          {!isLoading && hasSearched && !error && results.length === 0 && (
            <p className="text-sm text-stone-400">
              No results found. Try a different search.
            </p>
          )}

          {!hasSearched && (
            <p className="mt-6 text-sm text-stone-500">
              Try searching for &quot;Brandon Sanderson&quot;, &quot;cozy
              mystery&quot;, or &quot;Vietnamese fiction&quot; to get a feel
              for the results.
            </p>
          )}

          {results.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2">
              {results.map((book) => {
                const authors = book.authors.length ? book.authors.join(', ') : '';
                const year = book.publishedYear;
                const coverUrl = book.coverImageUrl;
                const detailsHref = book.id
                  ? `/book/${encodeURIComponent(book.id)}`
                  : null;

                return (
                  <li
                    key={book.id}
                    className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-3"
                  >
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="h-24 w-16 flex-shrink-0 rounded-md object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col">
                      <h2 className="text-sm font-semibold text-stone-50 md:text-base">
                        {book.title}
                      </h2>
                      {authors && (
                        <p className="mt-1 text-xs text-stone-400 md:text-sm">
                          {authors}
                        </p>
                      )}
                      {year && (
                        <p className="mt-1 text-xs text-stone-500">
                          First published {year}
                        </p>
                      )}
                      {detailsHref && (
                        <Link
                          href={detailsHref}
                          className="mt-auto w-fit rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-100 hover:bg-stone-700"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}


