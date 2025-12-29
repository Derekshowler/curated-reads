// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

function normalizeTag(raw: string) {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return "";

  // Hard cap for consistent pills
  const clipped = t.slice(0, 18);

  // Title-case-ish (optional)
  return clipped
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const bioRaw = typeof body.bio === "string" ? body.bio : null;
  const tagsRaw = Array.isArray(body.vibeTags) ? body.vibeTags : null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: { bio?: string | null; vibeTags?: string[] } = {};

  // Bio (optional)
  if (bioRaw !== null) {
    const trimmed = bioRaw.trim();
    data.bio = trimmed.length ? trimmed.slice(0, 180) : null;
  }

  // Vibe tags: 0–5, normalized, deduped (case-insensitive)
  if (tagsRaw !== null) {
    const normalized = tagsRaw
      .filter((x: unknown) => typeof x === "string")
      .map((s: string) => normalizeTag(s))
      .filter(Boolean);

    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const t of normalized) {
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      deduped.push(t);
      if (deduped.length >= 5) break;
    }

    data.vibeTags = deduped;
  }

  // Requires Profile.userId to be unique (recommended 1:1)
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: data,
    create: {
      userId: user.id,
      ...data,
    },
    select: {
      id: true,
      userId: true,
      displayName: true,
      bio: true,
      vibeTags: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, profile });
}
