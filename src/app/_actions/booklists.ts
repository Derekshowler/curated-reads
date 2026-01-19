"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/** If the user has no lists yet, make a default one. Returns listId. */
export async function ensureDefaultList() {
  const userId = await requireUserId();

  const existing = await prisma.bookList.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (existing) return { listId: existing.id };

  const baseName = "My First List";
  const baseSlug = slugify(baseName) || "my-first-list";

  // ensure slug uniqueness per user
  let slug = baseSlug;
  for (let i = 1; i <= 20; i++) {
    const dup = await prisma.bookList.findUnique({
      where: { userId_slug: { userId, slug } },
      select: { id: true },
    });
    if (!dup) break;
    slug = `${baseSlug}-${i}`;
  }

  const list = await prisma.bookList.create({
    data: {
      userId,
      name: baseName,
      slug,
      emoji: "📚",
      visibility: "PRIVATE",
      description: "A starter list to save books you like.",
    },
    select: { id: true },
  });

  return { listId: list.id };
}

export async function getMyListsLite() {
  const userId = await requireUserId();

  return prisma.bookList.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, emoji: true, slug: true, visibility: true },
  });
}

/**
 * Adds a book to a list.
 * If listId is missing, we create/use the default list automatically.
 */
export async function addBookToList(input: {
  listId?: string | null;
  book: {
    bookId: string; // stable id from ISBNdb (or fallback)
    title: string;
    authors?: string | null;
    coverImageUrl?: string | null;
    publishedYear?: string | null;
  };
}) {
  const userId = await requireUserId();

  const listId =
    input.listId && input.listId.trim()
      ? input.listId
      : (await ensureDefaultList()).listId;

  // Ownership check
  const owns = await prisma.bookList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!owns) throw new Error("List not found");

  // Insert (no dupes because @@unique([listId, bookId]))
  await prisma.bookListItem.upsert({
    where: { listId_bookId: { listId, bookId: input.book.bookId } },
    create: {
      listId,
      bookId: input.book.bookId,
      title: input.book.title,
      authors: input.book.authors ?? "",
      coverImageUrl: input.book.coverImageUrl ?? null,
      publishedYear: input.book.publishedYear ?? null,
    },
    update: {}, // noop if already exists
  });

  // touch updatedAt
  await prisma.bookList.update({
    where: { id: listId },
    data: { updatedAt: new Date() },
    select: { id: true },
  });

  return { ok: true, listId };
}
