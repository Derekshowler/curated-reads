// src/app/discover/discover-page-client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Book } from '@/lib/books/types';
import { SiteHeader } from '../_components/site-header';
import { useBookLists } from '@/lib/lists/useBookLists';
import type { ListBook } from '@/lib/lists/types';

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { lists, createList, addBookToList } = useBookLists();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListEmoji, setNewListEmoji] = useState('📚');

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

  function openAddToListPicker(book: Book) {
    setActiveBook(book);
    setIsPickerOpen(true);
    setNewListName('');
    setNewListEmoji('📚');
  }

  function closePicker() {
    setIsPickerOpen(false);
    setActiveBook(null);
  }

  function addActiveBookToList(listId: string) {
    if (!activeBook) return;

    const snapshot: ListBook = {
      id: activeBook.id,
      title: activeBook.title,
      authors: activeBook.authors,
      coverImageUrl: activeBook.coverImageUrl,
      publishedYear: activeBook.publishedYear,
    };

    addBookToList(listId, snapshot);
    setFeedbackMessage(`Added “${activeBook.title}” to your playlist`);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setFeedbackMessage(null), 2000);
    }
    closePicker();
  }

  function handleCreateListAndAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeBook) return;

    const trimmed = newListName.trim();
    if (!trimmed) return;

    const list = createList({
      name: trimmed,
      emoji: newListEmoji || '📚',
    });

    addActiveBookToList(list.id);
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
            Search across millions of books. Build playlists like Spotify —
            cozy reads, sad girl autumn, niche sci-fi. Follow &amp; share is
            coming soon.
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

          {feedbackMessage && (
            <p className="mt-4 text-xs text-amber-300">{feedbackMessage}</p>
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

                      <div className="mt-auto flex flex-wrap gap-2">
                        <Link
                          href={`/book/${encodeURIComponent(book.id)}`}
                          className="inline-flex w-fit rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-100 hover:bg-stone-700"
                        >
                          View details
                        </Link>

                        <button
                          type="button"
                          onClick={() => openAddToListPicker(book)}
                          className="inline-flex w-fit rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-100 hover:border-amber-400 hover:text-amber-200"
                        >
                          + Add to book list
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Simple list picker modal */}
      {isPickerOpen && activeBook && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-950 p-5">
            <h2 className="text-sm font-semibold text-stone-50">
              Add &quot;{activeBook.title}&quot; to a book list
            </h2>

            {lists.length > 0 && (
              <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">
                {lists.map((list) => (
                  <li key={list.id}>
                    <button
                      type="button"
                      onClick={() => addActiveBookToList(list.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-left hover:border-amber-400 hover:bg-stone-900/70"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{list.emoji ?? '📚'}</span>
                        <span className="text-sm text-stone-50">
                          {list.name}
                        </span>
                      </span>
                      <span className="text-xs text-stone-500">
                        {list.bookIds.length} book
                        {list.bookIds.length !== 1 ? 's' : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Create new list inline */}
            <form
              onSubmit={handleCreateListAndAdd}
              className="mt-5 rounded-lg border border-dashed border-stone-700 bg-stone-900/40 p-3 text-sm"
            >
              <p className="text-xs text-stone-400">Or create a new playlist</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newListEmoji}
                  onChange={(e) => setNewListEmoji(e.target.value)}
                  className="w-10 rounded-lg border border-stone-700 bg-stone-950 px-2 text-center text-xl"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Playlist name"
                  className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs outline-none placeholder:text-stone-500 focus:border-amber-400"
                />
              </div>
              <div className="mt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={closePicker}
                  className="rounded-full border border-stone-700 px-3 py-1 text-stone-300 hover:border-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-amber-500 px-3 py-1 font-medium text-stone-950 hover:bg-amber-400"
                >
                  Create &amp; add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
