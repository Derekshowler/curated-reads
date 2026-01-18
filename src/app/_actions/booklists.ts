'use server';

import { prisma } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import type { BookListVisibility } from '@prisma/client';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);

  // If you've added session callback to include id, this works:
  const sessionUserId = (session?.user as any)?.id as string | undefined;
  if (sessionUserId) return sessionUserId;

  // Fallback: look up by email (works out-of-the-box with NextAuth)
  const email = session?.user?.email;
  if (!email) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) throw new Error('User not found');

  return user.id;
}

async function generateUniqueSlug(userId: string, name: string) {
  const base = slugify(name) || 'list';

  // Find existing slugs that start with base
  const existing = await prisma.bookList.findMany({
    where: { userId, slug: { startsWith: base } },
    select: { slug: true },
  });

  if (existing.length === 0) return base;

  const used = new Set(existing.map((e) => e.slug));
  if (!used.has(base)) return base;

  // base-2, base-3, ...
  for (let i = 2; i < 9999; i++) {
    const candidate = `${base}-${i}`;
    if (!used.has(candidate)) return candidate;
  }

  // extremely unlikely fallback
  return `${base}-${Date.now()}`;
}

export async function createBookList(input: {
  name: string;
  description?: string;
  emoji?: string;
  visibility?: BookListVisibility;
}) {
  const userId = await requireUserId();

  const name = input.name.trim();
  if (!name) throw new Error('Name is required');

  const slug = await generateUniqueSlug(userId, name);

  const list = await prisma.bookList.create({
    data: {
      userId,
      name,
      slug,
      emoji: input.emoji?.trim() || null,
      description: input.description?.trim() || null,
      visibility: input.visibility ?? 'PRIVATE',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      visibility: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return list;
}

export async function getMyBookLists() {
  const userId = await requireUserId();

  return prisma.bookList.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      emoji: true,
      visibility: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });
}

/**
 * Adds a book to a list (your schema stores book fields directly on BookListItem).
 */
export async function addBookToList(input: {
  listId: string;
  book: {
    bookId: string; // IMPORTANT: stable external id (ISBNdb id OR ISBN13 string you choose)
    title: string;
    authors: string;
    coverImageUrl?: string | null;
    publishedYear?: string | null;
  };
  position?: number; // optional
}) {
  const userId = await requireUserId();

  // Ensure user owns the list
  const list = await prisma.bookList.findFirst({
    where: { id: input.listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error('List not found');

  const b = input.book;
  if (!b.bookId || !b.title || !b.authors) {
    throw new Error('bookId, title, and authors are required');
  }

  // Upsert list item by compound unique (listId, bookId)
  const item = await prisma.bookListItem.upsert({
    where: { listId_bookId: { listId: input.listId, bookId: b.bookId } },
    create: {
      listId: input.listId,
      bookId: b.bookId,
      position: input.position ?? 0,
      title: b.title,
      authors: b.authors,
      coverImageUrl: b.coverImageUrl ?? null,
      publishedYear: b.publishedYear ?? null,
    },
    update: {
      // optional: keep metadata fresh if the source changes
      title: b.title,
      authors: b.authors,
      coverImageUrl: b.coverImageUrl ?? null,
      publishedYear: b.publishedYear ?? null,
    },
    select: { id: true, listId: true, bookId: true },
  });

  return { ok: true, item };
}

export async function removeBookFromList(input: { listId: string; bookId: string }) {
  const userId = await requireUserId();

  // Ensure user owns the list
  const list = await prisma.bookList.findFirst({
    where: { id: input.listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error('List not found');

  await prisma.bookListItem.delete({
    where: { listId_bookId: { listId: input.listId, bookId: input.bookId } },
  });

  return { ok: true };
}
