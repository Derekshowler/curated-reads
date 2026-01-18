// src/app/profile/[username]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function LegacyProfileRedirectPage({ params }: PageProps) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { handle: decoded.toLowerCase() },
        { email: decoded.includes("@") ? decoded.toLowerCase() : undefined },
        { name: decoded },
      ],
    },
    select: { handle: true },
  });

  if (!user) return notFound();

  // If handle exists, canonical profile URL
  if (user.handle) redirect(`/u/${user.handle}`);

  // No handle set yet -> force them to set it (MVP rule)
  redirect("/settings/profile");
}
