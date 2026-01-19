// src/app/u/[handle]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProfileHeader } from "@/app/_components/profile/profile-header";
import { BookListVisibility } from "@prisma/client";

type PageProps = {
  params: Promise<{ handle: string }>;
};

function clampText(s: string, max = 110) {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function CoverStack({
  covers,
}: {
  covers: Array<{ coverImageUrl: string | null }>;
}) {
  const imgs = covers.map((c) => c.coverImageUrl).filter(Boolean) as string[];

  if (imgs.length === 0) {
    return (
      <div className="grid h-14 w-14 place-items-center rounded-xl border border-stone-800 bg-stone-950 text-[10px] text-stone-500">
        CR
      </div>
    );
  }

  if (imgs.length === 1) {
    return (
      <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  const grid = imgs.slice(0, 4);

  return (
    <div className="grid h-14 w-14 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
      <div className="grid h-full w-full grid-cols-2 grid-rows-2">
        {grid.map((src, i) => (
          <div key={i} className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        {grid.length < 4
          ? Array.from({ length: 4 - grid.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-full w-full border-l border-t border-stone-900 bg-stone-950"
              />
            ))
          : null}
      </div>
    </div>
  );
}

function ListCard({
  href,
  name,
  emoji,
  description,
  ownerHandle,
  visibility,
  itemCount,
  followerCount,
  covers,
  badgeLabel,
}: {
  href: string;
  name: string;
  emoji?: string | null;
  description?: string | null;
  ownerHandle: string;
  visibility: BookListVisibility;
  itemCount: number;
  followerCount: number;
  covers: Array<{ coverImageUrl: string | null }>;
  badgeLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "w-[280px] shrink-0 rounded-2xl border border-stone-800 bg-stone-900/60 p-4",
        "hover:border-stone-700 hover:bg-stone-900/80 transition-colors",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <CoverStack covers={covers} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-stone-50">
                {emoji ? `${emoji} ` : ""}
                {name}
              </div>
              <div className="mt-1 truncate text-xs text-stone-400">
                @{ownerHandle}
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-stone-800/70 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-stone-200">
              {badgeLabel ?? visibility}
            </span>
          </div>

          {description ? (
            <div className="mt-2 text-xs leading-relaxed text-stone-300/80">
              {clampText(description)}
            </div>
          ) : (
            <div className="mt-2 text-xs text-stone-500">—</div>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-stone-400">
            <span>
              {itemCount} book{itemCount === 1 ? "" : "s"}
            </span>
            <span className="text-stone-700">•</span>
            <span>
              {followerCount} follower{followerCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Shelf({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3">
        <div className="text-lg font-semibold text-stone-50">{title}</div>
        {subtitle ? (
          <div className="mt-0.5 text-sm text-stone-300/70">{subtitle}</div>
        ) : null}
      </div>

      <div className="relative">
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex gap-3 pb-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default async function Page({ params }: PageProps) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle).toLowerCase();

  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as any)?.id as string | undefined;

  const user = await prisma.user.findFirst({
    where: { handle: decodedHandle },
    select: {
      id: true,
      handle: true,
      name: true,
      email: true,
      image: true,
      profile: { select: { displayName: true, bio: true, vibeTags: true } },
    },
  });

  if (!user) return notFound();

  const isOwner = !!(viewerId && viewerId === user.id);

  // For non-owners: only show PUBLIC + UNLISTED lists
  const visibilityWhere = isOwner
    ? undefined
    : { in: [BookListVisibility.PUBLIC, BookListVisibility.UNLISTED] };

  // Owned lists
  const ownedLists = await prisma.bookList.findMany({
    where: {
      userId: user.id,
      ...(visibilityWhere ? { visibility: visibilityWhere } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 24,
    select: {
      id: true,
      name: true,
      slug: true,
      emoji: true,
      description: true,
      visibility: true,
      user: { select: { handle: true } }, // ✅ so list.user exists
      _count: { select: { items: true, followers: true } },
      items: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        take: 4,
        select: { coverImageUrl: true },
      },
    },
  });

  // Following lists (join table)
  const followingRows = await prisma.bookListFollow.findMany({
    where: {
      userId: user.id,
      list: visibilityWhere ? { visibility: visibilityWhere } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      list: {
        select: {
          id: true,
          name: true,
          slug: true,
          emoji: true,
          description: true,
          visibility: true,
          user: { select: { handle: true } },
          _count: { select: { items: true, followers: true } },
          items: {
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
            take: 4,
            select: { coverImageUrl: true },
          },
        },
      },
    },
  });

  const followingLists = followingRows.map((r) => r.list);

  const displayName =
    user.profile?.displayName ?? user.name ?? user.email ?? "Reader";

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <ProfileHeader
          data={{
            handle: user.handle ?? decodedHandle,
            displayName,
            avatarUrl: user.image,
            bio: user.profile?.bio ?? null,
            vibeTags: user.profile?.vibeTags ?? [],
            isOwner,
          }}
        />

        {/* Shelves */}
        <Shelf
          title="Lists"
          subtitle={isOwner ? "Your playlists" : `Public playlists by @${decodedHandle}`}
        >
          {ownedLists.length === 0 ? (
            <div className="w-full rounded-2xl border border-stone-800 bg-stone-900/40 p-4 text-sm text-stone-300/80">
              {isOwner ? (
                <>
                  No lists yet.{" "}
                  <Link href="/discover" className="underline hover:text-stone-100">
                    Go to Discover
                  </Link>{" "}
                  and add a book to start your first list.
                </>
              ) : (
                <>No public lists yet.</>
              )}
            </div>
          ) : (
            ownedLists.map((l) => {
              const ownerHandle = l.user.handle ?? decodedHandle;
              return (
                <ListCard
                  key={l.id}
                  href={`/u/${encodeURIComponent(ownerHandle)}/l/${encodeURIComponent(
                    l.slug
                  )}`}
                  name={l.name}
                  emoji={l.emoji}
                  description={l.description}
                  ownerHandle={ownerHandle}
                  visibility={l.visibility}
                  itemCount={l._count.items}
                  followerCount={l._count.followers}
                  covers={l.items}
                />
              );
            })
          )}
        </Shelf>

        <Shelf
          title="Following"
          subtitle={isOwner ? "Lists you’ve saved to your profile" : "Lists they follow"}
        >
          {followingLists.length === 0 ? (
            <div className="w-full rounded-2xl border border-stone-800 bg-stone-900/40 p-4 text-sm text-stone-300/80">
              {isOwner ? (
                <>
                  You aren’t following any lists yet. Browse{" "}
                  <Link href="/discover" className="underline hover:text-stone-100">
                    Discover
                  </Link>{" "}
                  and follow a playlist you like.
                </>
              ) : (
                <>No followed lists to show.</>
              )}
            </div>
          ) : (
            followingLists.map((l) => {
              const ownerHandle = l.user.handle ?? "unknown";
              return (
                <ListCard
                  key={l.id}
                  href={`/u/${encodeURIComponent(ownerHandle)}/l/${encodeURIComponent(
                    l.slug
                  )}`}
                  name={l.name}
                  emoji={l.emoji}
                  description={l.description}
                  ownerHandle={ownerHandle}
                  visibility={l.visibility}
                  itemCount={l._count.items}
                  followerCount={l._count.followers}
                  covers={l.items}
                  badgeLabel="FOLLOWING"
                />
              );
            })
          )}
        </Shelf>
      </div>
    </main>
  );
}
