import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../store/authSlice.js";
import { logoutApi } from "../api/auth.js";
import UnreadBadge from "./UnreadBadge.jsx";
import { useUnreadCounts } from "../hooks/useUnreadCounts.js";

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

function IconPlus({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.25"
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

const pillCls = ({ isActive }) =>
  clsx(
    "relative flex flex-col items-center justify-center gap-0.5 min-w-[3.25rem] py-1 rounded-2xl text-[10px] font-semibold transition",
    isActive ? "text-brand" : "text-orbit-muted",
  );

export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { messagesUnread, alertsUnread } = useUnreadCounts();

  async function handleLogout() {
    await logoutApi();
    dispatch(clearAuth());
    navigate("/login");
  }

  function scrollToComposer() {
    void navigate("/");
    let frames = 0;
    const tick = () => {
      const el = document.getElementById("create-post");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (frames++ < 90) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md flex-col gap-2">
        <div className="flex items-center justify-between gap-1 rounded-[1.75rem] border border-white/60 bg-white/80 backdrop-blur-xl px-2 py-2 shadow-orbit">
        <NavLink to="/" end className={pillCls}>
          <IconHome className="h-6 w-6" />
          Home
        </NavLink>
        <NavLink to="/chat" className={pillCls}>
          <span className="relative inline-flex">
            <IconChat className="h-6 w-6" />
            <span className="absolute -right-2 -top-1">
              <UnreadBadge count={messagesUnread} label="Unread messages" />
            </span>
          </span>
          Chat
        </NavLink>
        <button
          type="button"
          onClick={scrollToComposer}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lavender-light to-brand text-white shadow-orbit ring-4 ring-white/70 -mt-6"
          aria-label="New post"
        >
          <IconPlus className="h-6 w-6" />
        </button>
        <NavLink to="/notifications" className={pillCls}>
          <span className="relative inline-flex">
            <IconBell className="h-6 w-6" />
            <span className="absolute -right-2 -top-1">
              <UnreadBadge count={alertsUnread} label="Unread alerts" />
            </span>
          </span>
          Alerts
        </NavLink>
        <NavLink
          to={user?._id ? `/profile/${user._id}` : "/"}
          className={pillCls}
        >
          <IconUser className="h-6 w-6" />
          You
        </NavLink>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/65 bg-white/75 py-2.5 text-sm font-semibold text-orbit-muted shadow-soft ring-1 ring-white/45 backdrop-blur-xl transition hover:border-red-200/80 hover:bg-red-50/95 hover:text-red-800 hover:ring-red-200/35"
        >
          <IconLogout className="h-4 w-4" />
          Log out
        </button>
      </div>
    </nav>
  );
}
