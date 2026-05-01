import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationsRead,
} from "../api/services/notificationsService.js";

// FIXED: centralized axios instance

const typeCopy = {
  like: { icon: "♥", phrase: "liked your post" },
  comment: { icon: "💬", phrase: "commented on your post" },
  follow: { icon: "＋", phrase: "started following you" },
  message: { icon: "✉", phrase: "sent you a message" },
};

function phraseFor(type) {
  return typeCopy[type]?.phrase || "sent you a notification";
}

function iconFor(type) {
  return typeCopy[type]?.icon || "◇";
}

function notificationHref(n) {
  const fromId = n.fromUser?._id ?? n.fromUser;
  if (n.type === "message") {
    const cid = n.conversation?._id ?? n.conversation;
    if (cid) return `/chat/${cid}`;
  }
  if ((n.type === "like" || n.type === "comment") && n.post?._id) {
    return `/post/${n.post._id}`;
  }
  if (fromId) return `/profile/${fromId}`;
  return "/";
}

export default function Notifications() {
  const qc = useQueryClient();
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam, 25),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      if (!last?.hasMore) return undefined;
      const p = Number(last.page);
      return Number.isFinite(p) && p >= 1 ? p + 1 : undefined;
    },
  });

  const mark = useMutation({
    mutationFn: (body) => markNotificationsRead(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const pages = data?.pages ?? [];
  const items = pages.flatMap((p) => p?.items ?? []);
  const unreadCount = pages[0]?.unreadCount ?? 0;
  const markAllDisabled = unreadCount < 1 || mark.isPending;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-white/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-orbit-ink sm:text-[1.65rem]">
            Notifications
          </h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-orbit-muted">
            Likes, comments, follows, and messages in one place. Unread items
            are highlighted.
          </p>
          <p className="mt-2 text-xs font-medium text-brand-deep">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You’re all caught up"}
          </p>
        </div>
        <button
          type="button"
          disabled={markAllDisabled}
          onClick={() => mark.mutate({ markAll: true })}
          className="shrink-0 rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-brand shadow-soft ring-1 ring-lavender-light/50 transition hover:bg-white hover:ring-brand/25 disabled:pointer-events-none disabled:opacity-45"
        >
          {mark.isPending ? "Marking…" : "Mark all read"}
        </button>
      </header>

      {status === "pending" ? (
        <ul className="space-y-3" aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li
              key={i}
              className="flex gap-4 rounded-[1.35rem] border border-white/60 bg-white/70 p-4 ring-1 ring-white/40"
            >
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-lavender-mist/70" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-[min(65%,14rem)] animate-pulse rounded-md bg-lavender-mist/60" />
                <div className="h-3 w-[min(40%,10rem)] animate-pulse rounded-md bg-lavender-mist/50" />
              </div>
            </li>
          ))}
        </ul>
      ) : status === "error" ? (
        <div
          className="rounded-[1.35rem] border border-red-200/80 bg-red-50/90 px-5 py-8 text-center ring-1 ring-red-100"
          role="alert"
        >
          <p className="font-semibold text-red-900">
            Couldn’t load notifications
          </p>
          <p className="mt-2 text-sm text-red-800/90">
            {error?.message || "Check your connection and try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-2xl bg-brand px-5 py-2 text-sm font-semibold text-white shadow-orbit hover:bg-brand-hover"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[min(48vh,380px)] flex-col items-center justify-center gap-4 rounded-[1.35rem] border border-white/70 bg-white/75 px-6 py-14 text-center shadow-orbit ring-1 ring-brand/10 backdrop-blur-xl">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-mist to-lavender-light/80 text-3xl shadow-soft ring-1 ring-white/80"
            aria-hidden
          >
            🔔
          </div>
          <div className="max-w-sm space-y-2">
            <p className="text-base font-semibold text-orbit-ink">
              Nothing new here
            </p>
            <p className="text-sm leading-relaxed text-orbit-muted">
              When someone interacts with your posts or follows you, it will
              show up here.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-orbit transition hover:bg-brand-hover"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((n) => {
              const href = notificationHref(n);
              const unread = !n.read;
              const rawPreview =
                n.type === "message" && n.meta?.preview != null
                  ? String(n.meta.preview)
                  : n.post?.content != null
                    ? String(n.post.content)
                    : null;
              const preview =
                rawPreview && rawPreview.length > 72
                  ? `${rawPreview.slice(0, 72)}…`
                  : rawPreview;
              return (
                <li key={n._id}>
                  <div
                    className={`overflow-hidden rounded-[1.35rem] border transition ring-1 ${
                      unread
                        ? "border-lavender-light/55 bg-lavender-mist/45 shadow-soft ring-lavender-light/35"
                        : "border-white/65 bg-white/78 ring-white/40"
                    } backdrop-blur-xl`}
                  >
                    <Link
                      to={href}
                      onClick={() => {
                        if (unread) {
                          mark.mutate({ notificationIds: [n._id] });
                        }
                      }}
                      className="flex gap-3 p-4 text-left sm:gap-4 sm:p-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lavender-light/80 to-lavender-deep/50 text-lg shadow-soft ring-2 ring-white/90">
                        <span aria-hidden>{iconFor(n.type)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                          <span className="font-semibold text-orbit-ink">
                            @{n.fromUser?.username || "someone"}
                          </span>
                          <span className="text-sm text-orbit-muted">
                            {phraseFor(n.type)}
                          </span>
                        </div>
                        {preview ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-orbit-muted">
                            “{preview}”
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span className="text-orbit-muted tabular-nums">
                            {n.createdAt
                              ? formatDistanceToNow(new Date(n.createdAt), {
                                  addSuffix: true,
                                })
                              : ""}
                          </span>
                          {unread ? (
                            <span className="font-semibold text-brand-deep">
                              Open →
                            </span>
                          ) : (
                            <span className="text-orbit-muted">View</span>
                          )}
                        </div>
                      </div>
                      {unread ? (
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_3px_rgba(255,255,255,0.85)]"
                          aria-label="Unread"
                        />
                      ) : null}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
          {hasNextPage ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                className="rounded-2xl border border-white/80 bg-white/90 px-5 py-2.5 text-sm font-semibold text-brand-deep ring-1 ring-lavender-light/50 transition hover:bg-white hover:ring-brand/20 disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
