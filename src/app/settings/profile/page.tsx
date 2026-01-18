// src/app/settings/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

import { HandleForm } from "./_components/handle-form";
import { ProfileSettingsForm } from "./profile-settings-form.client";

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      handle: true, // ✅ NEW
      name: true,
      email: true,
      profile: {
        select: {
          displayName: true,
          bio: true,
          vibeTags: true,
        },
      },
    },
  });

  if (!user) redirect("/api/auth/signin");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
      <p className="mt-1 text-sm text-stone-300/70">
        Set your handle, add a short bio, and up to 5 vibe tags.
      </p>

      <div className="mt-6 space-y-6">
        {/* ✅ handle (set once for MVP) */}
        <HandleForm initialHandle={user.handle ?? null} />

        {/* existing bio + vibe tags */}
        <ProfileSettingsForm
          initialBio={user.profile?.bio ?? ""}
          initialVibeTags={user.profile?.vibeTags ?? []}
        />
      </div>
    </div>
  );
}
