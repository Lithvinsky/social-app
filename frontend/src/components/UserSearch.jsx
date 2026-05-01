import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchUsers,
  followUser,
  unfollowUser,
} from "../api/services/usersService.js";

// FIXED: improved component structure

/**
 * @param {"panel" | "navbar" | "sidebar"} variant
 * @param {string} [className]
 * @param {() => void} [onNavigate] — e.g. close mobile search overlay
 */
export default function UserSearch({
  variant = "panel",
  className = "",
  onNavigate,
}) {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(input.trim()), 320);
    return () => window.clearTimeout(t);
  }, [input]);

  const canSearch = debounced.length >= 2;

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["users", "search", debounced],
    queryFn: () => searchUsers(debounced),
    enabled: canSearch,
    staleTime: 20_000,
  });

  const toggleFollow = useMutation({
    mutationFn: async ({ userId, isFollowing }) => {
      if (isFollowing) await unfollowUser(userId);
      else await followUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "search", debounced] });
      qc.invalidateQueries({ queryKey: ["suggestions"] });
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  useEffect(() => {
    if (variant !== "navbar" && variant !== "sidebar") return undefined;
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [variant]);

  const showCompactDropdown =
    (variant === "navbar" || variant === "sidebar") && dropdownOpen;

  const inputCls =
    variant === "panel"
      ? "w-full input-orbit"
      : "w-full rounded-xl border-2 border-brand/12 bg-white/95 py-2 pl-9 pr-3 text-sm text-orbit-ink shadow-inner shadow-lavender-mist/20 placeholder:text-orbit-muted/65 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12";

  const resultsList = (
    <>
      {input.length > 0 && !canSearch ? (
        <p className="text-xs text-orbit-muted mt-2 px-0.5">
          Type at least 2 characters.
        </p>
      ) : null}
      {canSearch && isFetching ? (
        <p className="text-xs text-orbit-muted mt-2 px-0.5">Searching…</p>
      ) : null}
      {canSearch && !isFetching && results.length === 0 ? (
        <p className="text-xs text-orbit-muted mt-2 px-0.5">
          No users match that search.
        </p>
      ) : null}
      {results.length > 0 ? (
        <ul
          className={
            variant === "panel"
              ? "mt-3 space-y-2 max-h-56 overflow-y-auto"
              : "max-h-64 overflow-y-auto py-1"
          }
        >
          {results.map((u) => (
            <li
              key={u._id}
              className={
                variant === "panel"
                  ? "flex items-center gap-2 rounded-2xl border border-white/60 bg-white/50 px-2 py-2"
                  : "flex items-center gap-2 px-2 py-2 hover:bg-lavender-mist/50 rounded-xl"
              }
            >
              <Link
                to={`/profile/${u._id}`}
                onClick={() => {
                  onNavigate?.();
                  setDropdownOpen(false);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 hover:opacity-90"
              >
                {u.avatar ? (
                  <img
                    src={u.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender-mist text-xs font-bold text-brand">
                    {(u.username || "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate text-sm font-semibold text-orbit-ink">
                  @{u.username}
                </span>
              </Link>
              <button
                type="button"
                disabled={toggleFollow.isPending}
                onClick={() =>
                  toggleFollow.mutate({
                    userId: u._id,
                    isFollowing: u.isFollowing,
                  })
                }
                className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold ${
                  u.isFollowing
                    ? "border border-white/80 text-orbit-muted bg-white/40"
                    : "bg-brand text-white hover:bg-brand-hover shadow-soft"
                }`}
              >
                {u.isFollowing ? "Following" : "Follow"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  if (variant === "panel") {
    return (
      <div
        className={`glass-panel p-4 ring-1 ring-white/40 ${className}`}
      >
        <h2 className="text-sm font-semibold text-orbit-ink mb-2">
          Find people
        </h2>
        <p className="text-xs text-orbit-muted mb-2">
          Search by username, then follow someone new.
        </p>
        <input
          type="search"
          placeholder="e.g. alice, luis…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={inputCls}
          autoComplete="off"
          aria-label="Search users by username"
        />
        {resultsList}
      </div>
    );
  }

  const compactWrap =
    "relative min-w-0 " + className;

  return (
    <div ref={wrapRef} className={compactWrap}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-orbit-muted">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M16 16 21 21"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        type="search"
        placeholder="Search people…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
        className={inputCls}
        autoComplete="off"
        aria-label="Search users by username"
        aria-expanded={showCompactDropdown}
        aria-controls="user-search-results"
      />
      {showCompactDropdown ? (
        <div
          id="user-search-results"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-40 rounded-2xl border border-white/70 bg-white/95 py-2 shadow-orbit ring-1 ring-brand/10 backdrop-blur-xl"
        >
          <div className="px-2">
            {input.length === 0 ? (
              <p className="px-2 py-2 text-xs text-orbit-muted">
                Type at least 2 characters to find people by username.
              </p>
            ) : (
              resultsList
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
