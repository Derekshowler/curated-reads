// src/app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // We’re fine letting SessionProvider fetch `/api/auth/session` on its own
  return <SessionProvider>{children}</SessionProvider>;
}
