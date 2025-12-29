"use client";

import { useMemo, useState } from "react";

const SUGGESTED = [
  "Cozy",
  "Mystery",
  "Lit Fic",
  "Thriller",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Nonfiction",
  "Classics",
  "Short Reads",
];

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 18);
}

export function ProfileSettingsForm({
  initialBio,
  initialVibeTags,
}: {
  initialBio: string;
  initialVibeTags: string[];
}) {
  const [bio, setBio] = useState(initialBio);
  const [tags, setTags] = useState<string[]>(initialVibeTags.slice(0, 5));
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const remaining = 5 - tags.length;
  const lowerSet = useMemo(() => new Set(tags.map((t) => t.toLowerCase())), [tags]);
  const canAdd = remaining > 0;

  function addTag(raw: string) {
    const t = normalizeTag(raw);
    if (!t) return;

    if (tags.length >= 5) {
      setMsg("You can add up to 5 vibe tags.");
      return;
    }

    if (lowerSet.has(t.toLowerCase())) {
      setMsg("That tag is already added.");
      return;
    }

    setTags((prev) => [...prev, t]);
    setInput("");
    setMsg(null);
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
    setMsg(null);
  }

  async function save() {
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, vibeTags: tags }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Failed to save.");
      }

      setMsg("Saved ✅");
    } catch (e: any) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-stone-800/60 bg-stone-950 p-5">
      {/* Bio */}
      <div>
        <label className="text-sm font-medium text-stone-200">Bio</label>
        <p className="mt-1 text-xs text-stone-300/70">
          One or two lines is perfect. (Max 180 chars)
        </p>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 180))}
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-stone-800/70 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-600"
          placeholder="Cozy mysteries, clean sci-fi, and whatever convinces me to try next."
        />

        <div className="mt-2 text-xs text-stone-400">{bio.length}/180</div>
      </div>

      <div className="my-6 h-px bg-stone-800/60" />

      {/* Vibe tags */}
      <div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <label className="text-sm font-medium text-stone-200">Vibe tags</label>
            <p className="mt-1 text-xs text-stone-300/70">
              Add up to 5. These describe your reading taste.
            </p>
          </div>

          <div className="text-xs text-stone-400">{remaining} left</div>
        </div>

        {/* Current tags */}
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => removeTag(t)}
                className="group inline-flex items-center gap-2 rounded-full border border-stone-800/70 bg-stone-950 px-3 py-1.5 text-xs font-medium text-stone-100 hover:border-stone-600"
                aria-label={`Remove ${t}`}
                title="Tap to remove"
              >
                {t}
                <span className="text-stone-400 group-hover:text-stone-300">×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-400">
            No tags yet — add a few to make your profile feel like you.
          </p>
        )}

        {/* Add input */}
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(input);
              }
            }}
            disabled={!canAdd}
            className="flex-1 rounded-2xl border border-stone-800/70 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-stone-600 disabled:opacity-60"
            placeholder={canAdd ? "Add a tag (e.g., Cozy)" : "Max 5 tags reached"}
          />
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => addTag(input)}
            className="rounded-2xl border border-stone-800/70 bg-white/5 px-4 py-3 text-sm font-medium text-stone-100 hover:bg-white/10 disabled:opacity-60"
          >
            Add
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-4">
          <p className="text-xs text-stone-400">Suggestions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED.map((t) => {
              const disabled = !canAdd || lowerSet.has(t.toLowerCase());
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => addTag(t)}
                  className="rounded-full border border-stone-800/70 bg-stone-950 px-3 py-1.5 text-xs text-stone-200 hover:border-stone-600 disabled:opacity-50"
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-stone-300">{msg}</div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-stone-100 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
