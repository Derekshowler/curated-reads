// src/app/_actions/booklist-follow.ts
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function followBookList(input: { listId: string }) {
  const userId = await requireUserId();

  // Avoid following your own list (optional, but nice)
  const list = await prisma.bookList.findUnique({
    where: { id: input.listId },
    select: { userId: true },
  });
  if (!list) throw new Error("List not found");
  if (list.userId === userId) return { ok: true };

  await prisma.bookListFollow.upsert({
    where: { userId_listId: { userId, listId: input.listId } },
    create: { userId, listId: input.listId },
    update: {},
  });

  return { ok: true };
}

export async function unfollowBookList(input: { listId: string }) {
  const userId = await requireUserId();

  await prisma.bookListFollow.deleteMany({
    where: { userId, listId: input.listId },
  });

  return { ok: true };
}
