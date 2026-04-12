import { Link } from "react-router-dom";

export default function ChatPlaceholder() {
  return (
    <div className="flex min-h-[min(52vh,420px)] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-mist to-lavender-light/80 text-3xl shadow-soft ring-1 ring-white/80"
        aria-hidden
      >
        💬
      </div>
      <div className="max-w-sm space-y-2">
        <p className="text-base font-semibold text-orbit-ink">
          Pick a conversation
        </p>
        <p className="text-sm leading-relaxed text-orbit-muted">
          Choose someone from the list, or go to their profile and tap{" "}
          <span className="font-medium text-brand-deep">Message</span> to open a
          thread.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-deep shadow-soft ring-1 ring-lavender-light/50 transition hover:bg-white hover:ring-brand/20"
      >
        Back to home
      </Link>
    </div>
  );
}
