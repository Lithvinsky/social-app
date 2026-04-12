export default function UnreadBadge({ count, label }) {
  if (count == null || count < 1) return null;
  const text = count > 99 ? "99+" : String(count);
  return (
    <span
      className="inline-flex min-h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white tabular-nums leading-none ring-2 ring-white/90"
      aria-label={`${label}: ${count} unread`}
    >
      {text}
    </span>
  );
}
