// src/app/discover/discover-page-client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Book } from '@/lib/books/types';
import { SiteHeader } from '../_components/site-header';

export function DiscoverPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('cr_recent_searches');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as string[];
      setRecentSearches(parsed.slice(0, 5));
    } catch {
      // ignore bad JSON
    }
  }, []);

  // Helper to persist recent searches
  function recordRecentSearch(term: string) {
    if (typeof window === 'undefined') return;

    setRecentSearches((prev) => {
      const next = [
        term,
        ...prev.filter((q) => q.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 5);

      window.localStorage.setItem('cr_recent_searches', JSON.stringify(next));
      return next;
    });
  }

  // Core search function (used by form + recent-search chips + URL hydrate)
  async function runSearch(term: string) {
    const trimmed = term.trim();
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
      recordRecentSearch(trimmed);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while searching. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  // When the URL has ?q=..., hydrate the page from it
  useEffect(() => {
    if (!initialQuery) return;

    // keep input in sync with URL
    setQuery(initialQuery);
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    router.push(`/discover?q=${encodeURIComponent(trimmed)}`, {
      scroll: false,
    });
    await runSearch(trimmed);
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        {/* Shared site header */}
        <SiteHeader />

        {/* Search section */}
        <section className="mt-10">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Discover your next read
          </h1>
          <p className="mt-3 max-w-xl text-sm text-stone-300 md:text-base">
            Search across millions of books. We&apos;ll soon add vibes, moods,
            and personalized picks — for now, start exploring what&apos;s out
            there.
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

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
                Recent
              </span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    router.push(`/discover?q=${encodeURIComponent(term)}`, {
                      scroll: false,
                    });
                    runSearch(term);
                  }}
                  className="rounded-full border border-stone-700/70 bg-stone-900/70 px-3 py-1 text-xs text-stone-200 hover:border-amber-400/80 hover:text-amber-200"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          {!hasSearched && recentSearches.length === 0 && !error && (
            <p className="mt-6 text-sm text-stone-500">
              Try searching for &quot;Brandon Sanderson&quot;, &quot;cozy
              mystery&quot;, or &quot;Vietnamese fiction&quot; to get a feel
              for the results.
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

          {results.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2">
              {results.map((book) => {
                const authors = book.authors.join(', ');
                const year = book.publishedYear;
                const coverUrl = book.coverImageUrl;

                return (
                  <li
                    key={book.id}
                    className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-3 transition-transform transition-colors hover:-translate-y-0.5 hover:border-amber-500/60 hover:bg-stone-900"
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
                      <Link
                        href={`/book/${encodeURIComponent(book.id)}`}
                        className="mt-auto inline-flex w-fit rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-100 hover:bg-stone-700"
                      >
                        View details
                      </Link>
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
