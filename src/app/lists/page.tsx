// src/app/lists/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BookList } from '@/lib/lists/types';
import { useBookLists } from '@/lib/lists/useBookLists';
import { SiteHeader } from '../_components/site-header';

export default function ListsPage() {
  const { lists, createList } = useBookLists();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [description, setDescription] = useState('');

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const newList: BookList = createList({
      name: trimmed,
      description: description.trim() || undefined,
      emoji: emoji || '📚',
    });

    setName('');
    setEmoji('📚');
    setDescription('');
    setIsCreating(false);

    // Optionally navigate to the new list later
    // router.push(`/lists/${newList.id}`);
    console.log('Created list', newList.id);
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <SiteHeader />

        <div className="mt-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Your Book Playlists
            </h1>
            <p className="mt-2 text-sm text-stone-400 md:text-base">
              Curate lists the way you&apos;d make Spotify playlists — cozy
              vibes, yearly TBRs, niche obsessions. These will eventually be
              shareable &amp; followable.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating((v) => !v)}
            className="h-10 rounded-full border border-stone-700 bg-stone-900 px-4 text-xs font-medium text-stone-100 hover:border-amber-400 hover:text-amber-200"
          >
            {isCreating ? 'Cancel' : '+ New list'}
          </button>
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="mt-6 rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex flex-col gap-3"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-12 rounded-lg border border-stone-700 bg-stone-950 px-2 text-center text-xl"
                maxLength={2}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Playlist name (e.g. Sad Girl Autumn Reads)"
                className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="mt-1 h-20 w-full resize-none rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm outline-none placeholder:text-stone-500 focus:border-amber-400"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-stone-950 hover:bg-amber-400"
              >
                Create list
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {lists.length === 0 && !isCreating && (
          <div className="mt-10 rounded-xl border border-stone-800 bg-stone-900/40 p-6 text-center">
            <p className="text-stone-400">
              You haven&apos;t created any playlists yet.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Start by creating a list here or adding books from Discover.
            </p>
          </div>
        )}

        {/* Lists grid */}
        {lists.length > 0 && (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <li
                key={list.id}
                className="group rounded-xl border border-stone-800 bg-stone-900/60 p-5 transition-colors hover:border-amber-400/60 hover:bg-stone-900"
              >
                <Link href={`/lists/${list.id}`} className="flex h-full flex-col">
                  <div className="mb-4 text-4xl">{list.emoji ?? '📚'}</div>

                  <h2 className="text-lg font-medium text-stone-50 group-hover:text-amber-200">
                    {list.name}
                  </h2>

                  {list.description && (
                    <p className="mt-1 text-sm text-stone-400">
                      {list.description}
                    </p>
                  )}

                  <p className="mt-auto text-xs text-stone-500">
                    {list.bookIds.length} book
                    {list.bookIds.length !== 1 ? 's' : ''}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
