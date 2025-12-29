// src/app/settings/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "./profile-settings-form.client";

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      profiles: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          displayName: true,
          bio: true,
          vibeTags: true,
        },
      },
    },
  });

  if (!user) redirect("/api/auth/signin");

  const profile = user.profiles[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
      <p className="mt-1 text-sm text-stone-300/70">
        Keep it simple. This is your reading space.
      </p>

      <div className="mt-6">
        <ProfileSettingsForm
          initialBio={profile?.bio ?? ""}
          initialVibeTags={profile?.vibeTags ?? []}
        />
      </div>
    </div>
  );
}
