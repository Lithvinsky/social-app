import { Link } from "react-router-dom";

const APP_NAME = "Orbit";
const LOGO_SRC = "/Orbit-logo.png";

/**
 * Wordmark from `public/Orbit-logo.png`.
 * `mix-blend-screen` hides solid black backdrops against light UI without an alpha channel.
 * For pixel-perfect edges, replace the asset with a PNG that already has transparency.
 */
function OrbitWordmark({ wrapClass, imgClass, imgAlt }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center transition duration-200 ease-out group-hover/mark:opacity-95 ${wrapClass}`}
    >
      <img
        src={LOGO_SRC}
        alt={imgAlt}
        width={300}
        height={100}
        decoding="async"
        className={`block h-auto w-auto max-w-full object-contain object-center mix-blend-screen ${imgClass}`}
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
    "drop-shadow-[0_2px_14px_rgba(10,42,102,0.18)] group-hover/mark:drop-shadow-[0_4px_22px_rgba(10,42,102,0.26)]";

  const sizes = {
    sm: {
      layout: "row",
      rowClass: "inline-flex max-w-full items-center",
      wrap: "",
      img: `${drop} h-10 max-h-10 max-w-[min(11rem,calc(100vw-10rem))] sm:h-11 sm:max-h-11`,
    },
    md: {
      layout: "row",
      rowClass: "inline-flex min-w-0 max-w-full items-center",
      wrap: "",
      img: `${drop} h-[5.25rem] max-h-[5.25rem] max-w-[min(24.75rem,calc(100vw-11rem))] sm:h-24 sm:max-h-24 sm:max-w-[min(27.75rem,calc(100vw-12rem))]`,
    },
    lg: {
      layout: "row",
      rowClass: "inline-flex min-w-0 max-w-full items-center",
      wrap: "",
      img: `${drop} h-[6.75rem] max-h-[6.75rem] max-w-[min(31.5rem,100%)] sm:h-[7.5rem] sm:max-h-[7.5rem] sm:max-w-[min(34.5rem,100%)]`,
    },
    auth: {
      layout: "stacked",
      rowClass: "flex flex-col items-center gap-0",
      wrap: "",
      img: `${drop} h-48 max-h-48 max-w-[min(95vw,36rem)] sm:h-[14.25rem] sm:max-h-[14.25rem] sm:max-w-[min(95vw,42rem)] md:h-[15.75rem] md:max-h-[15.75rem]`,
    },
  };

  const s = sizes[size] || sizes.md;

  const imgAlt = clickable && to ? "" : APP_NAME;

  const row = (
    <span className={`${s.rowClass} ${className}`}>
      <OrbitWordmark wrapClass={s.wrap} imgClass={s.img} imgAlt={imgAlt} />
    </span>
  );

  if (clickable && to) {
    const linkLayout =
      s.layout === "stacked"
        ? `inline-flex max-w-full flex-col items-center rounded-2xl ${linkClass}`
        : `inline-flex min-w-0 max-w-full rounded-xl ${linkClass}`;

    return (
      <Link to={to} className={linkLayout} aria-label={APP_NAME}>
        {row}
      </Link>
    );
  }

  return row;
}

export { APP_NAME };
