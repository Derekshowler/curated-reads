// src/app/u/[handle]/l/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FollowButton } from "./_components/follow-button";

type PageProps = {
  params: Promise<{ handle: string; slug: string }>;
};

export default async function PublicBookListPage({ params }: PageProps) {
  const { handle, slug } = await params;

  const decodedHandle = decodeURIComponent(handle).toLowerCase();
  const decodedSlug = decodeURIComponent(slug);

  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as any)?.id as string | undefined;

  const list = await prisma.bookList.findFirst({
    where: {
      slug: decodedSlug,
      user: { handle: decodedHandle },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      emoji: true,
      description: true,
      visibility: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          handle: true,
          name: true,
          image: true,
          profile: { select: { displayName: true } },
        },
      },
      items: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          bookId: true,
          title: true,
          authors: true,
          coverImageUrl: true,
          publishedYear: true,
        },
      },

      // ✅ "am I following?" check (only fetch row for the viewer)
      followers: viewerId
        ? { where: { userId: viewerId }, select: { id: true } }
        : { select: { id: true }, take: 0 },
    },
  });

  if (!list) return notFound();

  const isOwner = !!(viewerId && viewerId === list.userId);

  // Visibility gate
  if (list.visibility === "PRIVATE" && !isOwner) return notFound();

  const isFollowing = !!(viewerId && list.followers.length > 0);

  const ownerHandle = list.user.handle ?? decodedHandle;
  const ownerName =
    list.user.profile?.displayName ?? list.user.name ?? `@${ownerHandle}`;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* breadcrumb */}
        <div className="text-xs text-stone-400">
          <Link href={`/u/${ownerHandle}`} className="hover:text-stone-200">
            @{ownerHandle}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-stone-300">{list.slug}</span>
        </div>

        {/* Header */}
        <div className="mt-6 rounded-3xl border border-stone-800/60 bg-stone-950 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-stone-50">
                {list.emoji ? `${list.emoji} ` : ""}
                {list.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-300/80">
                <Link
                  href={`/u/${ownerHandle}`}
                  className="inline-flex items-center gap-2 hover:text-stone-200"
                >
                  {list.user.image ? (
                    <span className="relative h-6 w-6 overflow-hidden rounded-full border border-stone-800/70">
                      <Image
                        src={list.user.image}
                        alt=""
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-800/70 bg-stone-900 text-[10px]">
                      CR
                    </span>
                  )}
                  <span>by {ownerName}</span>
                </Link>

                <span className="text-stone-600">•</span>

                <span className="rounded-full border border-stone-800/70 bg-white/5 px-2.5 py-1 text-xs text-stone-200">
                  {list.visibility}
                </span>

                <span className="text-stone-600">•</span>

                <span className="text-xs text-stone-400">
                  {list.items.length} book{list.items.length === 1 ? "" : "s"}
                </span>
              </div>

              {list.description ? (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200/90">
                  {list.description}
                </p>
              ) : null}
            </div>

            {/* Right-side actions */}
            <div className="flex shrink-0 items-center gap-2">
              {isOwner ? (
                <Link
                  href={`/settings/lists/${list.id}`}
                  className="rounded-full border border-stone-800/70 bg-white/5 px-4 py-2 text-sm font-medium text-stone-100 hover:bg-white/10"
                >
                  Edit list
                </Link>
              ) : (
                <FollowButton
                  listId={list.id}
                  initialIsFollowing={isFollowing}
                  disabledReason={!viewerId ? "Sign in to follow lists" : null}
                />
              )}
            </div>
          </div>
        </div>

        {/* Books */}
        <section className="mt-8">
          {list.items.length === 0 ? (
            <div className="rounded-3xl border border-stone-800/60 bg-stone-950 p-6 text-sm text-stone-300/80">
              No books in this list yet.
              {isOwner ? " Add some from Discover." : null}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {list.items.map((b) => (
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

                    <div className="mt-auto flex gap-2 pt-3">
                      <Link
                        href={`/book/${encodeURIComponent(b.bookId)}`}
                        className="inline-flex w-fit rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-100 hover:bg-stone-700"
                      >
                        View details
                      </Link>
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
