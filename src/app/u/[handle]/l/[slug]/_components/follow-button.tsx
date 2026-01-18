"use client";

import { useState, useTransition } from "react";
import { followBookList, unfollowBookList } from "@/app/_actions/booklist-follow";
import { useRouter } from "next/navigation";

export function FollowButton({
  listId,
  initialIsFollowing,
  disabledReason,
}: {
  listId: string;
  initialIsFollowing: boolean;
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const disabled = isPending || !!disabledReason;

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabledReason ?? ""}
      onClick={() => {
        startTransition(async () => {
          try {
            if (isFollowing) {
              await unfollowBookList({ listId });
              setIsFollowing(false);
            } else {
              await followBookList({ listId });
              setIsFollowing(true);
            }
            router.refresh();
          } catch {
            // If not authed, server action will throw. You can later route to signin.
          }
        });
      }}
      className={[
        "rounded-full px-4 py-2 text-sm font-medium transition",
        isFollowing
          ? "border border-stone-800/70 bg-white/5 text-stone-100 hover:bg-white/10"
          : "bg-white text-stone-950 hover:bg-stone-100",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      {isPending ? "…" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
