"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMyHandle } from "@/app/_actions/handle";

export function HandleForm({ initialHandle }: { initialHandle?: string | null }) {
  const router = useRouter();

  const [handle, setHandle] = useState(initialHandle ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disabled = Boolean(initialHandle) || isPending;

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-4">
      <div className="text-sm font-semibold text-stone-100">Your handle</div>
      <div className="mt-1 text-xs text-stone-400">
        Used for your public profile URL (set once for MVP).
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-stone-400">curated-reads.io/u/</span>
        <input
          value={handle}
          onChange={(e) => {
            setErr(null);
            setOk(null);
            setHandle(e.target.value);
          }}
          disabled={disabled}
          className="w-56 rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-stone-100 outline-none focus:border-stone-600"
          placeholder="derekshowler"
        />

        <button
          disabled={disabled}
          onClick={() => {
            setErr(null);
            setOk(null);
            startTransition(async () => {
              try {
                const res = await setMyHandle({ handle });
                setOk(`Saved as @${res.handle}`);
                router.refresh();
              } catch (e: any) {
                setErr(e?.message ?? "Failed to save handle");
              }
            });
          }}
          className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-950 disabled:opacity-50"
        >
          Save
        </button>
      </div>

      {err ? <div className="mt-2 text-sm text-red-400">{err}</div> : null}
      {ok ? <div className="mt-2 text-sm text-green-400">{ok}</div> : null}
      {initialHandle ? (
        <div className="mt-2 text-xs text-stone-500">Current: @{initialHandle}</div>
      ) : null}
    </div>
  );
}
