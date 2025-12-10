// src/app/_components/site-header.tsx
type SiteHeaderProps = {
  active?: 'home' | 'discover';
};

export function SiteHeader({ active }: SiteHeaderProps) {
  const baseLink =
    'rounded-full border border-stone-700 px-3 py-1 hover:border-stone-500 hover:text-stone-100';
  const activeLink = 'rounded-full bg-stone-800 px-3 py-1 text-stone-100';

  return (
    <header className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/90 text-sm font-semibold">
          CR
        </span>
        <span className="text-lg font-semibold tracking-tight">
          Curated Reads
        </span>
      </div>
      <nav className="flex items-center gap-4 text-sm text-stone-300">
        <a
          href="/"
          className={active === 'home' ? activeLink : baseLink}
        >
          Home
        </a>
        <a
          href="/discover"
          className={active === 'discover' ? activeLink : baseLink}
        >
          Discover
        </a>
      </nav>
    </header>
  );
}
