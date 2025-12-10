// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/90 text-sm font-semibold">
              CR
            </span>
            <span className="text-lg font-semibold tracking-tight">Curated Reads</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-stone-300">
            <a
              href="/discover"
              className="rounded-full border border-stone-700 px-3 py-1 hover:border-stone-500 hover:text-stone-100"
            >
              Discover
            </a>
            <button className="rounded-full border border-stone-700 px-3 py-1 hover:border-stone-500 hover:text-stone-100">
              Log in
            </button>
            <button className="rounded-full bg-amber-500 px-3 py-1 text-stone-950 font-medium hover:bg-amber-400">
              Get started
            </button>
          </nav>
        </header>


        {/* Hero */}
        <section className="mt-20 flex flex-1 flex-col gap-10 md:flex-row md:items-center">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              A smarter way to find
              <span className="block text-amber-400">your next read.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm text-stone-300 md:text-base">
              CuratedReads surfaces the books you&apos;ll actually love — no
              endless scrolling, no generic lists, just handpicked reads that
              feel like you.
            </p>

            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email for early access"
                className="h-11 flex-1 rounded-full border border-stone-700 bg-stone-900/70 px-4 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-400"
              />
              <button
                type="submit"
                className="h-11 rounded-full bg-amber-500 px-6 text-sm font-medium text-stone-950 hover:bg-amber-400"
              >
                Join the waitlist
              </button>
            </form>

            <p className="mt-3 text-xs text-stone-500">
              No spam. Just early access and occasional book recs.
            </p>
          </div>

          {/* Right side “tonight’s picks” mock */}
          <div className="mt-10 md:mt-0 md:w-1/2">
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-lg shadow-black/40">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Tonight&apos;s picks
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-stone-800/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-stone-50">
                      A Quiet Winter Town
                    </p>
                    <p className="text-xs text-stone-400">cozy · mystery</p>
                  </div>
                  <span className="text-xs text-amber-300">Matched for you</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-stone-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-stone-50">
                      Letters from the Attic
                    </p>
                    <p className="text-xs text-stone-400">literary · slow burn</p>
                  </div>
                  <span className="text-xs text-stone-500">
                    Because you liked &quot;Eleanor Oliphant&quot;
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-stone-900/80 px-3 py-2">
                  <div>
                    <p className="font-medium text-stone-50">
                      The Lantern Keeper
                    </p>
                    <p className="text-xs text-stone-400">fantasy · atmospheric</p>
                  </div>
                  <span className="text-xs text-stone-500">Rainy night pick</span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-stone-500">
              Mock data — real recommendations coming soon.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
