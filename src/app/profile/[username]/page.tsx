// src/app/profile/[username]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProfileHeader } from "@/app/_components/profile/profile-header";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  const session = await getServerSession(authOptions);
  const viewerEmail = session?.user?.email ?? null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: decoded },
        { email: decoded.includes("@") ? decoded : undefined },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profile: {
        select: { displayName: true, bio: true, vibeTags: true },
      },
    },
  });

  if (!user) return notFound();

  const displayName =
    user.profile?.displayName ?? user.name ?? user.email ?? "Reader";

  const isOwner = !!(viewerEmail && user.email && viewerEmail === user.email);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ProfileHeader
        data={{
          username: decoded,
          displayName,
          avatarUrl: user.image,
          bio: user.profile?.bio ?? null,
          vibeTags: user.profile?.vibeTags ?? [],
          isOwner,
        }}
      />

      <div className="mt-6 rounded-3xl border border-stone-800/60 bg-stone-950 p-5 text-sm text-stone-300/80">
        Next: Featured + Lists shelf.
      </div>
    </div>
  );
}
