"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { addBookToList, getMyListsLite } from "@/app/_actions/booklists";

type BookHit = {
  id: string;
  title: string;
  authors?: string | null;
  coverImageUrl?: string | null;
  publishedYear?: string | null;
};

// 🔧 IMPORTANT: point this to whatever you already use for ISBNdb searching.
// If you don't have one yet, make /api/books/search as a proxy.
async function searchBooks(q: string): Promise<BookHit[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const j = await res.json();
  return (j?.results ?? []) as BookHit[];
}

export default function SearchPage() {
  const { status } = useSession();
  const [tab, setTab] = useState<"books" | "lists">("books");
  const [q, setQ] = useState("");
  const [books, setBooks] = useState<BookHit[]>([]);
  const [loading, setLoading] = useState(false);

  const [myLists, setMyLists] = useState<
    { id: string; name: string; emoji: string | null; slug: string; visibility: string }[]
  >([]);

  const [selectedListId, setSelectedListId] = useState<string | "auto">("auto");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  // Load your lists when signed in (for dropdown)
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const lists = await getMyListsLite();
        setMyLists(lists as any);
      } catch {
        // ignore
      }
    })();
  }, [status]);

  async function runSearch() {
    setMsg(null);

    if (tab === "books") {
      setLoading(true);
      try {
        const hits = await searchBooks(q);
        setBooks(hits);
      } finally {
        setLoading(false);
      }
    }

    // Lists tab will be wired next (Prisma query + sort by followers)
  }

  const canSearch = q.trim().length >= 2;

  const listSelectDisabled = status !== "authenticated" || myLists.length === 0;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-50">
          Search
        </h1>
        <p className="mt-1 text-sm text-stone-300/70">
          Find books and curated lists.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("books")}
          className={[
            "rounded-full border px-4 py-2 text-sm",
            tab === "books"
              ? "border-stone-600 bg-white/10 text-stone-50"
              : "border-stone-800/70 bg-stone-950 text-stone-300 hover:border-stone-700",
          ].join(" ")}
        >
          Books
        </button>
        <button
          type="button"
          onClick={() => setTab("lists")}
          className={[
            "rounded-full border px-4 py-2 text-sm",
            tab === "lists"
              ? "border-stone-600 bg-white/10 text-stone-50"
              : "border-stone-800/70 bg-stone-950 text-stone-300 hover:border-stone-700",
          ].join(" ")}
        >
          Lists
        </button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-stone-800/60 bg-stone-950 p-4 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSearch) runSearch();
          }}
          placeholder={tab === "books" ? "Search books (title, author…)" : "Search lists (name, handle…)"}
          className="flex-1 rounded-2xl border border-stone-800/70 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-600"
        />

        <button
          type="button"
          onClick={runSearch}
          disabled={!canSearch || loading}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-stone-950 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Add-to-list controls (Books tab only) */}
      {tab === "books" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-300/80">
          <span className="text-xs text-stone-400">Add to:</span>

          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value as any)}
            disabled={listSelectDisabled}
            className="rounded-xl border border-stone-800/70 bg-stone-950 px-3 py-2 text-sm text-stone-100 disabled:opacity-60"
          >
            <option value="auto">
              {status !== "authenticated"
                ? "Sign in to save"
                : myLists.length === 0
                  ? "My First List (auto-create)"
                  : "My First List (auto-create)"}
            </option>

            {myLists.map((l) => (
              <option key={l.id} value={l.id}>
                {(l.emoji ?? "📚") + " " + l.name}
              </option>
            ))}
          </select>

          {msg ? <span className="text-xs text-stone-400">{msg}</span> : null}
        </div>
      ) : null}

      {/* Results */}
      <div className="mt-6">
        {tab === "books" ? (
          <>
            {!loading && canSearch && books.length === 0 ? (
              <div className="rounded-3xl border border-stone-800/60 bg-stone-950 p-6 text-sm text-stone-300/80">
                No results found.
              </div>
            ) : null}

            <ul className="grid gap-4 md:grid-cols-2">
              {books.map((b) => (
                <li
                  key={b.id}
                  className="flex gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-3"
                >
                  {b.coverImageUrl ? (
                    <img
                      src={b.coverImageUrl}
                      alt={b.title}
                      className="h-24 w-16 flex-shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-24 w-16 flex-shrink-0 rounded-md border border-stone-800 bg-stone-950" />
                  )}

                  <div className="flex flex-1 flex-col">
                    <div>
                      <h2 className="text-sm font-semibold text-stone-50">
                        {b.title}
                      </h2>
                      {b.authors ? (
                        <p className="mt-1 text-xs text-stone-400">{b.authors}</p>
                      ) : null}
                      {b.publishedYear ? (
                        <p className="mt-1 text-xs text-stone-500">
                          First published {b.publishedYear}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <Link
                        href={`/book/${encodeURIComponent(b.id)}`}
                        className="inline-flex w-fit rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-100 hover:bg-stone-700"
                      >
                        View details
                      </Link>

                      <button
                        type="button"
                        disabled={status !== "authenticated" || isPending}
                        onClick={() => {
                          setMsg(null);
                          startTransition(async () => {
                            try {
                              await addBookToList({
                                listId: selectedListId === "auto" ? null : selectedListId,
                                book: {
                                  bookId: b.id,
                                  title: b.title,
                                  authors: b.authors ?? null,
                                  coverImageUrl: b.coverImageUrl ?? null,
                                  publishedYear: b.publishedYear ?? null,
                                },
                              });
                              setMsg("Saved ✅");
                              // refresh lists after first save (auto-creates default)
                              if (myLists.length === 0) {
                                const lists = await getMyListsLite();
                                setMyLists(lists as any);
                              }
                            } catch (e: any) {
                              setMsg(e?.message ?? "Failed to save");
                            }
                          });
                        }}
                        className="inline-flex w-fit rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60"
                        title={status !== "authenticated" ? "Sign in to save books" : undefined}
                      >
                        + Add to list
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="rounded-3xl border border-stone-800/60 bg-stone-950 p-6 text-sm text-stone-300/80">
            Lists search next: Prisma query + sort by most followed.
          </div>
        )}
      </div>
    </div>
  );
}
