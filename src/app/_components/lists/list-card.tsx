// src/app/_components/lists/list-card.tsx
import Link from "next/link";
import Image from "next/image";

export type ListCardData = {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  description?: string | null;
  visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
  updatedAt: Date;

  owner: {
    handle: string;
    displayName: string;
    image?: string | null;
  };

  counts: {
    followers: number;
    items: number;
  };

  covers: string[]; // 0..3 cover urls
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ListCard({ list }: { list: ListCardData }) {
  const href = `/user/${encodeURIComponent(list.owner.handle)}/list/${encodeURIComponent(
    list.slug
  )}`;

  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-stone-800/60 bg-stone-950 p-4 hover:border-stone-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-stone-50">
            {list.emoji ? `${list.emoji} ` : ""}
            {list.name}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
            {list.owner.image ? (
              <span className="relative h-5 w-5 overflow-hidden rounded-full border border-stone-800/70">
                <Image
                  src={list.owner.image}
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-800/70 bg-stone-900 text-[9px]">
                CR
              </span>
            )}
            <span className="truncate">
              by <span className="text-stone-200">@{list.owner.handle}</span>
            </span>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-stone-800/70 bg-white/5 px-2.5 py-1 text-[11px] text-stone-200">
          {list.visibility}
        </span>
      </div>

      {/* cover strip */}
      <div className="mt-4 flex items-center gap-2">
        {list.covers.slice(0, 3).map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="h-16 w-11 overflow-hidden rounded-xl border border-stone-800 bg-stone-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        {list.covers.length === 0 ? (
          <div className="h-16 flex-1 rounded-2xl border border-dashed border-stone-800 bg-stone-950/40" />
        ) : (
          <div className="h-16 flex-1 rounded-2xl border border-stone-800 bg-stone-950/40" />
        )}
      </div>

      {list.description ? (
        <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-stone-300/80">
          {list.description}
        </p>
      ) : (
        <p className="mt-4 text-xs text-stone-500">No description yet.</p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
        <span>
          {fmt(list.counts.followers)} follower{list.counts.followers === 1 ? "" : "s"}
        </span>
        <span>
          {fmt(list.counts.items)} book{list.counts.items === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
