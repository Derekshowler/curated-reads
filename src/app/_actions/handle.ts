"use server";

import { prisma } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

function normalizeHandle(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "")   // allow letters/numbers/underscore only
    .replace(/^_+|_+$/g, "");     // no leading/trailing underscores
}

export async function setMyHandle(input: { handle: string }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error("Not authenticated");

  const handle = normalizeHandle(input.handle);
  if (!handle) throw new Error("Handle is required");
  if (handle.length < 3) throw new Error("Handle must be at least 3 characters");
  if (handle.length > 20) throw new Error("Handle must be 20 characters or less");

  // Optional: reserve words
  const reserved = new Set(["admin", "settings", "discover", "api", "u", "profile", "login"]);
  if (reserved.has(handle)) throw new Error("That handle is reserved");

  // If you want "set once" behavior for MVP:
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { handle: true },
  });

  if (me?.handle) {
    throw new Error("Handle already set");
  }

  // Update (unique constraint enforces uniqueness)
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { handle },
      select: { handle: true },
    });
    return updated;
  } catch (e: any) {
    // Prisma unique constraint error code is usually P2002
    if (e?.code === "P2002") throw new Error("Handle already taken");
    throw e;
  }
}
