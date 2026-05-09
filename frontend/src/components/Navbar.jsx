import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UnreadBadge from "./UnreadBadge.jsx";
import UserSearch from "./UserSearch.jsx";
import BrandMark from "./BrandMark.jsx";
import { useUnreadCounts } from "../hooks/useUnreadCounts.js";

function IconChat({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 18.5 4 21v-3.5A8 8 0 0 1 9.5 5h5A8 8 0 0 1 20 12.5v.5a8 8 0 0 1-8 8H7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBell({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 16h12l-1.5-2V10a4.5 4.5 0 1 0-9 0v4L6 16Zm6 3a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 19Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
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
  );
}

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const accessToken = useSelector((s) => s.auth.accessToken);
  const { messagesUnread, alertsUnread } = useUnreadCounts();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  if (!accessToken) {
    return (
      <header className="glass-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <BrandMark to="/" size="sm" />
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-orbit-muted hover:text-orbit-ink"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold rounded-2xl bg-brand px-4 py-2 text-white shadow-soft hover:bg-brand-hover"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="glass-header sticky top-0 z-20">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
        <div className="mx-1 hidden min-w-0 max-w-xl flex-1 sm:mx-3 md:block">
          <UserSearch variant="navbar" />
        </div>
        <button
          type="button"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition md:hidden ${
            mobileSearchOpen
              ? "bg-white/90 text-brand ring-1 ring-lavender-light/60"
              : "text-orbit-muted hover:bg-white/60 hover:text-brand"
          }`}
          aria-label="Search people"
          aria-expanded={mobileSearchOpen}
          onClick={() => setMobileSearchOpen((o) => !o)}
        >
          <IconSearch className="h-5 w-5" />
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            to="/chat"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-orbit-muted hover:bg-white/60 hover:text-brand"
            aria-label="Messages"
          >
            <IconChat className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5">
              <UnreadBadge count={messagesUnread} label="Unread messages" />
            </span>
          </Link>
          <Link
            to="/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-orbit-muted hover:bg-white/60 hover:text-brand"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5">
              <UnreadBadge count={alertsUnread} label="Unread alerts" />
            </span>
          </Link>
          <Link
            to={user?._id ? `/profile/${user._id}` : "/"}
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-lavender-mist/80 text-sm font-bold text-brand hover:bg-lavender-light/50"
            aria-label="My profile"
          >
            {(user?.username || "?").slice(0, 1).toUpperCase()}
          </Link>
        </div>
      </div>
      {mobileSearchOpen ? (
        <div className="md:hidden border-t border-white/50 bg-white/92 backdrop-blur-xl px-4 py-3 shadow-lg">
          <UserSearch
            variant="navbar"
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      ) : null}
    </header>
  );
}
