import { Link, Outlet, matchPath, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { listConversations } from "../api/chat.js";
import { useSelector } from "react-redux";
import UnreadBadge from "../components/UnreadBadge.jsx";

export default function Chat() {
  const location = useLocation();
  const match = matchPath(
    { path: "/chat/:conversationId", end: true },
    location.pathname,
  );
  const conversationId = match?.params?.conversationId;
  const me = useSelector((s) => s.auth.user);
  const { data: convs, status } = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
  });

  const list = convs || [];

  return (
    <div className="space-y-6">
      <header className="border-b border-white/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-orbit-ink sm:text-[1.65rem]">
          Messages
        </h1>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-orbit-muted">
          Direct conversations with people you follow. Open someone’s profile to
          start a new chat.
        </p>
      </header>

      <div className="flex min-h-[min(72vh,680px)] flex-col gap-4 md:flex-row md:gap-5">
        <aside
          className={`w-full shrink-0 overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/80 shadow-orbit ring-1 ring-brand/10 backdrop-blur-xl md:max-w-[20rem] ${
            conversationId ? "hidden md:block" : ""
          }`}
        >
          <div className="h-1 w-full bg-gradient-to-r from-lavender-light via-brand-muted to-brand" />
          <div className="p-3 sm:p-4">
            <h2 className="sr-only">Conversation list</h2>
            {status === "pending" ? (
              <ul className="space-y-2" aria-hidden>
                {[1, 2, 3, 4].map((i) => (
                  <li
                    key={i}
                    className="h-[4.25rem] animate-pulse rounded-2xl bg-lavender-mist/50 ring-1 ring-white/50"
                  />
                ))}
              </ul>
            ) : status === "error" ? (
              <p className="rounded-2xl border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-sm text-red-800">
                Could not load conversations. Refresh and try again.
              </p>
            ) : list.length === 0 ? (
              <div className="rounded-2xl border border-white/80 bg-lavender-mist/40 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-orbit-ink">
                  No conversations yet
                </p>
                <p className="mt-2 text-xs leading-relaxed text-orbit-muted">
                  Visit a profile and use <span className="font-medium text-brand-deep">Message</span>{" "}
                  to start chatting.
                </p>
              </div>
            ) : (
              <ul className="max-h-[min(60vh,520px)] space-y-1 overflow-y-auto pr-0.5 md:max-h-[min(68vh,600px)]">
                {list.map((c) => {
                  const other =
                    c.otherUser ||
                    c.participants?.find(
                      (p) => String(p._id) !== String(me?._id),
                    );
                  const active = conversationId === c._id;
                  const unread = Number(c.unreadCount) || 0;
                  return (
                    <li key={c._id}>
                      <Link
                        to={`/chat/${c._id}`}
                        className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-white/95 text-orbit-ink shadow-soft ring-1 ring-lavender-light/60"
                            : "text-orbit-ink hover:bg-white/60"
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lavender-light/80 to-lavender-deep/50 text-sm font-bold text-brand-deep shadow-soft ring-2 ring-white/90">
                          {(other?.username || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold">
                              @{other?.username}
                            </span>
                            <UnreadBadge count={unread} label="Unread in thread" />
                          </div>
                          <div className="mt-0.5 truncate text-xs text-orbit-muted">
                            {c.lastMessage || "No messages yet"}
                          </div>
                          {c.lastMessageAt ? (
                            <div className="mt-1 text-[10px] text-orbit-muted/90">
                              {formatDistanceToNow(new Date(c.lastMessageAt), {
                                addSuffix: true,
                              })}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section
          className={`flex min-h-[min(64vh,560px)] flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/82 shadow-orbit ring-1 ring-brand/10 backdrop-blur-xl ${
            conversationId ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-brand/30 via-lavender-light to-lavender-deep/40" />
          <div className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
