"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

function initials(nameOrEmail?: string | null) {
  const s = (nameOrEmail ?? "").trim();
  if (!s) return "CR";

  // If email, use first chunk (before @)
  const base = s.includes("@") ? s.split("@")[0] : s;

  const parts = base.split(/[\s._-]+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || "CR";
}

function profileHrefFromSession(email?: string | null) {
  // Temporary: until we add Profile.handle, use email so lookup works.
  if (!email) return "/settings/profile";
  return `/profile/${encodeURIComponent(email)}`;
}

function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const user = session?.user;
  const email = user?.email ?? null;
  const name = user?.name ?? null;
  const imageUrl = user?.image ?? null;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Not signed in: show Sign in button (same spot)
  if (status !== "authenticated") {
    return (
      <Link
        href="/api/auth/signin"
        className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-stone-100 hover:bg-white/15"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar button (replaces “Sign out”) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-stone-700/60 bg-stone-950 hover:border-stone-600"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile avatar"
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-stone-200">
            {initials(name ?? email)}
          </span>
        )}
      </button>

      {/* Menu */}
      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-800/70 bg-stone-950 shadow-xl">
          <div className="px-4 py-3">
            <div className="truncate text-sm font-semibold text-stone-100">
              {name ?? "Signed in"}
            </div>
            <div className="truncate text-xs text-stone-400">{email}</div>
          </div>

          <div className="h-px bg-stone-800/60" />

          <div className="p-2">
            <Link
              href={profileHrefFromSession(email)}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-stone-100 hover:bg-white/5"
            >
              My profile
            </Link>

            <Link
              href="/settings/profile"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-stone-100 hover:bg-white/5"
            >
              Edit profile
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-stone-100 hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-sm font-bold text-stone-950">
          CR
        </div>
        <div className="text-lg font-semibold tracking-tight text-stone-50">
          Curated Reads
        </div>
      </Link>

      {/* Nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="rounded-full border border-stone-700/60 bg-stone-950 px-4 py-2 text-sm text-stone-100 hover:border-stone-600"
        >
          Home
        </Link>
        <Link
          href="/discover"
          className="rounded-full border border-stone-700/60 bg-stone-950 px-4 py-2 text-sm text-stone-100 hover:border-stone-600"
        >
          Discover
        </Link>

        {/* Account */}
        <AccountMenu />
      </div>
    </div>
  );
}
