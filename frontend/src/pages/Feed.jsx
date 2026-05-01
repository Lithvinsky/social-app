import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchFeed } from "../api/services/postsService.js";

// FIXED: centralized axios instance
import CreatePost from "../components/CreatePost.jsx";
import PostCard from "../components/PostCard.jsx";

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass-panel-strong h-36 animate-pulse rounded-2xl ring-1 ring-white/30 bg-gradient-to-r from-white/50 via-lavender-mist/40 to-white/50"
        />
      ))}
    </div>
  );
}

export default function Feed() {
  const sentinelRef = useRef(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam }) =>
        fetchFeed({ pageParam: pageParam ?? 1, limit: 10 }),
      getNextPageParam: (last) => {
        if (!last?.hasMore) return undefined;
        const p = Number(last.page);
        const n = Number.isFinite(p) && p >= 1 ? p : 1;
        return n + 1;
      },
      initialPageParam: 1,
    });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flatMap((p) => p?.items ?? []) ?? [];

  return (
    <div className="space-y-8">
      <header className="border-b border-white/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-orbit-ink sm:text-[1.65rem]">
          Home
        </h1>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-orbit-muted">
          Updates from people you follow. Share something with{" "}
          <span className="font-medium text-brand/90">Create a post</span>{" "}
          below.
        </p>
      </header>

      <CreatePost />

      {status === "pending" ? (
        <FeedSkeleton />
      ) : status === "error" ? (
        <div
          className="glass-panel-strong rounded-2xl px-6 py-8 text-center ring-1 ring-red-200/60"
          role="alert"
        >
          <p className="font-semibold text-red-800">Couldn&apos;t load feed</p>
          <p className="mt-2 text-sm text-orbit-muted">
            Check your connection and refresh the page.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-2xl px-6 py-14 text-center ring-1 ring-white/50">
          <p className="text-lg font-semibold text-orbit-ink">
            Nothing here yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-orbit-muted">
            When people you follow post, you&apos;ll see their updates here. You
            can start the conversation with a post above.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-8" />
      {isFetchingNextPage ? (
        <p className="py-4 text-center text-sm font-medium text-orbit-muted">
          <span className="inline-flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand"
              aria-hidden
            />
            Loading more…
          </span>
        </p>
      ) : null}
    </div>
  );
}
