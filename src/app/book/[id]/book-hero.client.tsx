'use client';

import { useEffect, useState } from 'react';
import type { Book } from '@/lib/books/types';
import type { BookTheme } from '@/lib/books/theme';

type Props = {
  book: Book;
  initialTheme: BookTheme;
  moodTags: string[];
};

export function BookHeroClient({ book, initialTheme, moodTags }: Props) {
  const [theme, setTheme] = useState<BookTheme>(initialTheme);

  // Once on the client, sample the cover and adjust theme
  useEffect(() => {
    if (!book.coverImageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = book.coverImageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = (canvas.width = 40);
      const h = (canvas.height = 40);
      ctx.drawImage(img, 0, 0, w, h);

      const { data } = ctx.getImageData(0, 0, w, h);

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 200) continue; // skip transparent pixels

        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      if (!count) return;

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Convert to HSL for nicer tweaking
      const {
        h: hue,
        s: sat,
        l: light,
      } = rgbToHsl(r, g, b);

      // Slightly richer palette: darker base, brighter + more saturated end
      const from = hslToRgbString(
        hue,
        Math.min(sat + 0.1, 1),
        Math.max(light - 0.15, 0)
      );
      const to = hslToRgbString(
        hue,
        Math.min(sat + 0.2, 1),
        Math.min(light + 0.1, 1)
      );

      setTheme((prev) => ({
        ...prev,
        heroBgFrom: from,
        heroBgTo: to,
      }));
    };
  }, [book.coverImageUrl]);

  // --- Hero markup using the dynamic theme ---

  return (
    <section
      className="relative mt-6 overflow-hidden rounded-3xl border border-stone-800/80"
      style={{ backgroundColor: theme.heroBgFrom }}
    >
      {book.coverImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 blur-3xl"
          style={{
            backgroundImage: `url(${book.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'scale(1.1)',
          }}
        />
      )}

      <div
        className="relative px-6 py-6 md:px-8 md:py-8"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 55%),
            linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.65)),
            linear-gradient(135deg, ${theme.heroBgFrom}, ${theme.heroBgTo})
          `,
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row">
          {book.coverImageUrl && (
            <div className="flex-shrink-0 self-center md:self-start">
              <div className="inline-block overflow-hidden rounded-2xl bg-stone-900/80 shadow-2xl shadow-black/70">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="h-80 w-52 object-cover md:h-96 md:w-60"
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-300/90">
              Book
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="mt-2 text-sm text-stone-200 md:text-base">
                {book.subtitle}
              </p>
            )}

            {book.authors.length > 0 && (
              <p className="mt-4 text-sm font-medium text-stone-50 md:text-base">
                {book.authors.join(', ')}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {book.publishedYear && (
                <span
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: 'rgba(5,10,25,0.85)',
                    color: theme.chipText,
                  }}
                >
                  First published {book.publishedYear}
                </span>
              )}
              {book.pageCount && (
                <span
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: 'rgba(5,10,25,0.85)',
                    color: theme.chipText,
                  }}
                >
                  {book.pageCount} pages
                </span>
              )}
              {book.publisher && (
                <span
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: 'rgba(5,10,25,0.85)',
                    color: theme.chipText,
                  }}
                >
                  Publisher: {book.publisher}
                </span>
              )}
              {book.isbn13 && (
                <span
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: 'rgba(5,10,25,0.85)',
                    color: theme.chipText,
                  }}
                >
                  ISBN-13: {book.isbn13}
                </span>
              )}
            </div>
          </div>
        </div>

        {moodTags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {moodTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] transition-all hover:scale-105"
                style={{
                  backgroundColor: 'rgba(5,10,25,0.85)',
                  color: theme.chipText,
                  border: `1px solid ${theme.accent}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- helpers (top-level, not inside the component) ---------- */

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

function hslToRgbString(h: number, s: number, l: number) {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l; // gray
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )})`;
}
