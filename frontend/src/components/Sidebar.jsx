import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../store/authSlice.js";
import { logoutApi } from "../api/services/authService.js";
import BrandMark from "./BrandMark.jsx";
import UnreadBadge from "./UnreadBadge.jsx";
import { useUnreadCounts } from "../hooks/useUnreadCounts.js";

// FIXED: centralized axios instance

function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function IconUser({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 20.5c.5-4 3.5-6.5 6.5-6.5s6 2.5 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLogout({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3m0 0 3.5-3.5M3 12l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const itemCls = ({ isActive }) =>
  clsx(
    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-white/90 text-brand shadow-glow"
      : "text-orbit-muted hover:bg-white/50 hover:text-brand-deep",
  );

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { messagesUnread, alertsUnread } = useUnreadCounts();

  async function handleLogout() {
    await logoutApi();
    dispatch(clearAuth());
    navigate("/login");
  }

  return (
    <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-10 w-[15.5rem] overflow-y-auto border-r border-surface-muted bg-surface px-3 py-6">
      <div className="px-2 mb-8">
        <BrandMark to="/" size="lg" />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <NavLink to="/" end className={itemCls}>
          <IconHome className="h-5 w-5 opacity-80" />
          Home
        </NavLink>
        <NavLink to="/chat" className={itemCls}>
          <IconChat className="h-5 w-5 opacity-80" />
          <span className="flex items-center gap-2">
            Messages
            <UnreadBadge count={messagesUnread} label="Unread messages" />
          </span>
        </NavLink>
        <NavLink to="/notifications" className={itemCls}>
          <IconBell className="h-5 w-5 opacity-80" />
          <span className="flex items-center gap-2">
            Alerts
            <UnreadBadge count={alertsUnread} label="Unread alerts" />
          </span>
        </NavLink>
        <NavLink
          to={user?._id ? `/profile/${user._id}` : "/"}
          className={itemCls}
        >
          <IconUser className="h-5 w-5 opacity-80" />
          Profile
        </NavLink>
      </nav>
      <div className="mt-auto border-t border-white/40 pt-4 px-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/70 bg-white/55 py-3 text-sm font-semibold text-orbit-ink shadow-soft ring-1 ring-white/50 backdrop-blur-sm transition hover:border-red-200/70 hover:bg-red-50/90 hover:text-red-800 hover:ring-red-200/40"
        >
          <IconLogout className="h-5 w-5 opacity-80" />
          Log out
        </button>
      </div>
    </aside>
  );
}
