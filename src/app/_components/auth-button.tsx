// src/app/_components/auth-button.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border px-4 py-1.5 text-xs font-medium opacity-60"
      >
        Checking session…
      </button>
    );
  }

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => signIn('google')}
        className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="rounded-full border px-4 py-1.5 text-xs font-medium hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}
