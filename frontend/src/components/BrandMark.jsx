import { Link } from "react-router-dom";

const APP_NAME = "Orbit";
/** Wordmark — use a transparent PNG in `public/orbit-logo.png` for best results on light UI. */
const LOGO_SRC = "/orbit-logo.png";

/** 3× prior sizes: md was ~h-7 / max-w 8.25rem → h-[5.25rem] / max-w-[24.75rem] (clamped on small screens). */
function OrbitWordmark({ wrapClass, imgClass }) {
  return (
    <span
      className={`inline-flex items-center justify-center transition duration-200 ease-out group-hover/mark:opacity-95 ${wrapClass}`}
    >
      <img
        src={LOGO_SRC}
        alt={APP_NAME}
        decoding="async"
        className={`object-contain object-center ${imgClass}`}
      />
    </span>
  );
}

const linkClass =
  "group/mark outline-none ring-brand/0 transition duration-200 ease-out hover:scale-[1.02] hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.99]";

/** App logo; wraps in `<Link>` when `clickable` and `to` are set. */
export default function BrandMark({
  to = "/",
  className = "",
  size = "md",
  clickable = true,
}) {
  const drop =
    "drop-shadow-[0_2px_14px_rgba(106,79,191,0.22)] group-hover/mark:drop-shadow-[0_4px_22px_rgba(106,79,191,0.32)]";

  const sizes = {
    md: {
      layout: "row",
      rowClass: "inline-flex min-w-0 max-w-full items-center",
      wrap: "",
      img: `${drop} h-[5.25rem] w-auto max-h-[5.25rem] max-w-[min(24.75rem,calc(100vw-11rem))] sm:h-24 sm:max-h-24 sm:max-w-[min(27.75rem,calc(100vw-12rem))]`,
    },
    lg: {
      layout: "row",
      rowClass: "inline-flex min-w-0 max-w-full items-center",
      wrap: "",
      img: `${drop} h-[6.75rem] w-auto max-h-[6.75rem] max-w-[min(31.5rem,100%)] sm:h-[7.5rem] sm:max-h-[7.5rem] sm:max-w-[min(34.5rem,100%)]`,
    },
    auth: {
      layout: "stacked",
      rowClass: "flex flex-col items-center gap-0",
      wrap: "",
      img: `${drop} h-48 w-auto max-h-48 max-w-[min(95vw,36rem)] sm:h-[14.25rem] sm:max-h-[14.25rem] sm:max-w-[min(95vw,42rem)] md:h-[15.75rem] md:max-h-[15.75rem]`,
    },
  };

  const s = sizes[size] || sizes.md;

  const row = (
    <span className={`${s.rowClass} ${className}`}>
      <OrbitWordmark wrapClass={s.wrap} imgClass={s.img} />
    </span>
  );

  if (clickable && to) {
    const linkLayout =
      s.layout === "stacked"
        ? `inline-flex max-w-full flex-col items-center rounded-2xl ${linkClass}`
        : `inline-flex min-w-0 max-w-full rounded-xl ${linkClass}`;

    return (
      <Link to={to} className={linkLayout}>
        {row}
      </Link>
    );
  }

  return row;
}

export { APP_NAME };
