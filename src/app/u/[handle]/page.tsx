// src/app/u/[handle]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProfileHeader } from "@/app/_components/profile/profile-header";

type PageProps = {
  params: Promise<{ handle: string }>;
};

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

  if (!user) notFound();

  const isOwner = !!(viewerId && viewerId === user.id);
  const displayName =
    user.profile?.displayName ?? user.name ?? user.email ?? "Reader";

  const lists = await prisma.bookList.findMany({
    where: {
      userId: user.id,
      ...(isOwner ? {} : { visibility: { in: ["PUBLIC", "UNLISTED"] } }),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      emoji: true,
      description: true,
      visibility: true,
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ProfileHeader
        data={{
          handle: user.handle ?? "",
          displayName,
          avatarUrl: user.image,
          bio: user.profile?.bio ?? null,
          vibeTags: user.profile?.vibeTags ?? [],
          isOwner,
        }}
      />

      <div className="mt-6 rounded-3xl border border-stone-800/60 bg-stone-950 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-100">Booklists</h2>
          {isOwner ? (
            <Link
              href="/settings/profile"
              className="text-xs text-stone-300/80 hover:text-stone-100"
            >
              Manage →
            </Link>
          ) : null}
        </div>

        {lists.length === 0 ? (
          <div className="mt-4 text-sm text-stone-300/80">
            {isOwner ? "No booklists yet. Create one next." : "No public booklists yet."}
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {lists.map((l) => (
              <Link
                key={l.id}
                href={`/u/${encodeURIComponent(user.handle ?? decodedHandle)}/l/${encodeURIComponent(
                  l.slug
                )}`}
                className="rounded-2xl border border-stone-800/70 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="truncate text-sm font-semibold text-stone-50">
                  {l.emoji ? `${l.emoji} ` : ""}
                  {l.name}
                </div>

                {l.description ? (
                  <div className="mt-1 line-clamp-2 text-xs text-stone-300/70">
                    {l.description}
                  </div>
                ) : null}

                <div className="mt-2 text-xs text-stone-400">
                  {l._count.items} book{l._count.items === 1 ? "" : "s"}
                  <span className="mx-2 text-stone-700">•</span>
                  {l.visibility}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
