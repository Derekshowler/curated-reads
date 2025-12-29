import Image from "next/image";
import Link from "next/link";

export type ProfileHeaderData = {
  username: string;              // URL slug/handle
  displayName: string;           // fallback to user.name/email
  avatarUrl?: string | null;     // from user.image
  bio?: string | null;           // from profile.bio
  vibeTags?: string[];           // from profile.vibeTags
  isOwner?: boolean;             // owner sees edit link
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const init = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return init || "CR";
}

export function ProfileHeader({ data }: { data: ProfileHeaderData }) {
  const { username, displayName, avatarUrl, bio, vibeTags = [], isOwner = false } = data;
  const tags = vibeTags.slice(0, 5);

  return (
    <header className="w-full">
      <div className="rounded-3xl border border-stone-800/60 bg-stone-950">
        <div className="px-4 pt-5 pb-4 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {avatarUrl ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-950">
                  <Image
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    fill
                    sizes="56px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-stone-800/70 bg-stone-950 text-sm font-semibold text-stone-200">
                  {initials(displayName)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold tracking-tight text-stone-50">
                    {displayName}
                  </h1>
                  <p className="mt-0.5 truncate text-sm text-stone-300/70">
                    @{username}
                  </p>
                </div>

                {isOwner ? (
                  <Link
                    href="/settings/profile"
                    className="shrink-0 rounded-full border border-stone-800/70 bg-white/5 px-3 py-1.5 text-sm font-medium text-stone-100 hover:bg-white/10"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>

              {bio ? (
                <p className="mt-3 text-sm leading-relaxed text-stone-200/90">
                  {bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-stone-400">
                  {isOwner ? "Add a bio to make your profile feel like you." : "—"}
                </p>
              )}

              {tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-stone-800/70 bg-white/5 px-2.5 py-1 text-xs font-medium text-stone-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                isOwner ? (
                  <div className="mt-3 text-xs text-stone-400">
                    Add up to 5 vibe tags (e.g., Cozy • Mystery • Lit Fic)
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-stone-800/60" />
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
            <span>Reading space</span>
            <span className="italic">Curated Reads</span>
          </div>
        </div>
      </div>
    </header>
  );
}
