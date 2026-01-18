// src/app/lists/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyListRedirect({ params }: PageProps) {
  const { id } = await params;

  const list = await prisma.bookList.findUnique({
    where: { id },
    select: {
      slug: true,
      user: { select: { handle: true } },
    },
  });

  if (!list?.user.handle) return notFound();

  redirect(`/u/${list.user.handle}/l/${list.slug}`);
}
