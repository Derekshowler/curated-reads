"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  itemGapClassName?: string; // e.g. "gap-3"
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function HScrollRow({
  title,
  subtitle,
  children,
  className = "",
  itemGapClassName = "gap-3",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;

    setCanLeft(left > 2);
    setCanRight(left < max - 2);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    update();

    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    // Netflix-ish: scroll by ~90% of visible width
    const page = Math.floor(el.clientWidth * 0.9);
    const target = el.scrollLeft + dir * page;

    el.scrollTo({
      left: clamp(target, 0, el.scrollWidth),
      behavior: "smooth",
    });
  };

  // show arrows only when hover on desktop; always allow swipe on mobile
  return (
    <section className={className}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title ? (
            <div className="text-xl font-semibold text-stone-50">{title}</div>
          ) : null}
          {subtitle ? (
            <div className="mt-0.5 text-sm text-stone-300/70">{subtitle}</div>
          ) : null}
        </div>
      )}

      <div className="group relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
          disabled={!canLeft}
          className={[
            "absolute left-0 top-0 z-10 hidden h-full items-center px-2 sm:flex",
            "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            !canLeft ? "pointer-events-none" : "",
          ].join(" ")}
        >
          <div className="grid h-10 w-10 place-items-center rounded-full border border-stone-700/60 bg-stone-950/80 text-stone-100 backdrop-blur hover:bg-stone-900">
            <span className="text-xl leading-none">‹</span>
          </div>
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
          disabled={!canRight}
          className={[
            "absolute right-0 top-0 z-10 hidden h-full items-center px-2 sm:flex",
            "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            !canRight ? "pointer-events-none" : "",
          ].join(" ")}
        >
          <div className="grid h-10 w-10 place-items-center rounded-full border border-stone-700/60 bg-stone-950/80 text-stone-100 backdrop-blur hover:bg-stone-900">
            <span className="text-xl leading-none">›</span>
          </div>
        </button>

        {/* Fade edges (Netflix vibe) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-stone-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-stone-950 to-transparent" />

        {/* Scroller */}
        <div
          ref={scrollerRef}
          className={[
            "no-scrollbar overflow-x-auto scroll-smooth",
            "px-1 sm:px-8", // leaves room for arrows
          ].join(" ")}
        >
          <div className={["flex", itemGapClassName].join(" ")}>{children}</div>
        </div>
      </div>
    </section>
  );
}
