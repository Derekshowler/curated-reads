// src/app/lists/[id]/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '../../_components/site-header';
import { useBookLists } from '@/lib/lists/useBookLists';
import type { ListBook } from '@/lib/lists/types';

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lists, updateListMeta, removeBookFromList } = useBookLists();

  const list = useMemo(
    () => lists.find((l) => l.id === params.id),
    [lists, params.id]
  );

  const [name, setName] = useState(list?.name ?? '');
  const [emoji, setEmoji] = useState(list?.emoji ?? '📚');
  const [description, setDescription] = useState(list?.description ?? '');

  // If no list found (after lists loaded), show a simple not-found state
  if (!list) {
    if (lists.length > 0) {
      return (
        <main className="min-h-screen bg-stone-950 text-stone-50">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <SiteHeader />
            <p className="mt-10 text-sm text-stone-400">
              Playlist not found. It might have been deleted or this link is invalid.
            </p>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-stone-950 text-stone-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <SiteHeader />
          <p className="mt-10 text-sm text-stone-400">Loading playlist…</p>
        </div>
      </main>
    );
  }

  const hasChanges =
    name !== list.name ||
    emoji !== (list.emoji ?? '📚') ||
    (description || '') !== (list.description || '');

  function handleSaveMeta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasChanges) return;

    // list is guaranteed to exist because we early-return above,
    // and we defensively assert non-null for TypeScript.
    updateListMeta(list!.id, {
      name: name.trim() || list!.name,
      emoji: emoji || '📚',
      description: description.trim() || undefined,
    });
  }

  function handleRemoveBook(book: ListBook) {
    // Same here: list is guaranteed but TS needs the assertion.
    removeBookFromList(list!.id, book.id);
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <SiteHeader />

        <div className="mt-8 flex items-center gap-2 text-xs text-stone-500">
          <button
            type="button"
            onClick={() => router.push('/lists')}
            className="rounded-full border border-stone-700 px-3 py-1 hover:border-amber-400 hover:text-amber-200"
          >
            ← All playlists
          </button>
        </div>

        <form
          onSubmit={handleSaveMeta}
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="h-12 w-12 rounded-lg border border-stone-700 bg-stone-950 text-center text-3xl"
              maxLength={2}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-lg font-semibold outline-none placeholder:text-stone-500 focus:border-amber-400"
              placeholder="Playlist name"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24 w-full resize-none rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400"
            placeholder="Add a short description for this playlist"
          />

          <div className="flex justify-between text-xs text-stone-500">
            <span>
              {list.bookIds.length} book
              {list.bookIds.length !== 1 ? 's' : ''}
            </span>
            <button
              type="submit"
              disabled={!hasChanges}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-stone-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
            >
              Save changes
            </button>
          </div>
        </form>

        {/* Books in playlist */}
        <section className="mt-10">
          {list.books.length === 0 ? (
            <p className="text-sm text-stone-400">
              No books in this playlist yet. Add some from the Discover page.
            </p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {list.books.map((book) => (
                <li
                  key={book.id}
                  className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-3"
                >
                  {book.coverImageUrl && (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="h-24 w-16 flex-shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col">
                    <h2 className="text-sm font-semibold text-stone-50">
                      {book.title}
                    </h2>
                    {book.authors?.length ? (
                      <p className="mt-1 text-xs text-stone-400">
                        {book.authors.join(', ')}
                      </p>
                    ) : null}
                    {book.publishedYear && (
                      <p className="mt-1 text-xs text-stone-500">
                        First published {book.publishedYear}
                      </p>
                    )}

                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/book/${encodeURIComponent(book.id)}`}
                        className="inline-flex w-fit rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-100 hover:bg-stone-700"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(book)}
                        className="inline-flex w-fit rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-200 hover:border-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
