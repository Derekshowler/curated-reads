// src/app/search/_components/search-bar.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchType = "all" | "lists" | "books";
type ListSort = "top" | "new";

export function SearchBar({
  initialQ,
  initialType,
  initialSort,
}: {
  initialQ: string;
  initialType: SearchType;
  initialSort: ListSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState<SearchType>(initialType);
  const [sort, setSort] = useState<ListSort>(initialSort);
  const [isPending, startTransition] = useTransition();

  const active = useMemo(() => {
    const qs = new URLSearchParams(sp?.toString());
    return {
      q: qs.get("q") ?? "",
      type: (qs.get("type") ?? "all") as SearchType,
      sort: (qs.get("sort") ?? "top") as ListSort,
    };
  }, [sp]);

  function push(next: Partial<{ q: string; type: SearchType; sort: ListSort }>) {
    const qs = new URLSearchParams(sp?.toString());
    if (next.q !== undefined) {
      const trimmed = next.q.trim();
      if (trimmed) qs.set("q", trimmed);
      else qs.delete("q");
    }
    if (next.type !== undefined) {
      qs.set("type", next.type);
    }
    if (next.sort !== undefined) {
      qs.set("sort", next.sort);
    }
    // keep take default
    startTransition(() => {
      router.push(`${pathname}?${qs.toString()}`);
    });
  }

  return (
    <div className="rounded-3xl border border-stone-800/60 bg-stone-950 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold text-stone-100">Search</div>
          <p className="mt-1 text-xs text-stone-300/70">
            Find lists, books, and people’s reading taste.
          </p>

          <form
            className="mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              push({ q });
            }}
          >
            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try: cozy mysteries, @derekshowler, sci-fi…"
                className="w-full rounded-2xl border border-stone-800/70 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-600"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-950 hover:bg-stone-100 disabled:opacity-60"
              >
                {isPending ? "…" : "Go"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "lists", "books"] as const).map((t) => {
            const on = active.type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  push({ type: t });
                }}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  on
                    ? "border-stone-600 bg-white/10 text-stone-100"
                    : "border-stone-800/70 bg-stone-950 text-stone-300 hover:border-stone-600 hover:text-stone-100",
                ].join(" ")}
              >
                {t === "all" ? "All" : t === "lists" ? "Lists" : "Books"}
              </button>
            );
          })}

          {/* Sort only matters for lists */}
          <select
            value={sort}
            onChange={(e) => {
              const v = (e.target.value as ListSort) || "top";
              setSort(v);
              push({ sort: v });
            }}
            className="rounded-full border border-stone-800/70 bg-stone-950 px-3 py-1.5 text-xs text-stone-200 outline-none focus:border-stone-600"
          >
            <option value="top">Most followed</option>
            <option value="new">Newest</option>
          </select>
        </div>
      </div>
    </div>
  );
}
