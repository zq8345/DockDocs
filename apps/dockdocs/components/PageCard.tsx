"use client";

import { ThumbCard } from "./ThumbCard";

/**
 * PageCard — the page-thumbnail family member of ThumbCard.
 * One square card per PDF page: thumbnail (object-contain on neutral bg),
 * page label below, and the light selection treatment — ✓/✕ corner badge +
 * tone border + dimming. Never a full-card color overlay.
 *
 * Client-specific semantics stay thin and declarative: delete marks pages
 * with tone="danger" + grayscale imgClassName, rotate passes imgStyle with a
 * rotation transform, split tints the frame via frameStyle, reorder overrides
 * topRight with its remove button and spreads drag props.
 */

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PageCard({
  src,
  alt,
  pageLabel,
  selected = false,
  tone = "accent",
  dim = false,
  badge,
  topRight,
  onSelect,
  imgClassName,
  imgStyle,
  labelClassName,
  frameStyle,
  className,
  ...rest
}: {
  /** Page thumbnail data URL. */
  src: string;
  alt: string;
  /** Line below the thumbnail (page number). */
  pageLabel: React.ReactNode;
  /** Selected: tone border + corner badge (✓ accent / ✕ danger). */
  selected?: boolean;
  tone?: "accent" | "danger";
  /** Dim the thumbnail (e.g. unselected pages while selecting). */
  dim?: boolean;
  /** Top-left slot inside the frame (e.g. order number). */
  badge?: React.ReactNode;
  /** Replaces the default selected corner badge (e.g. reorder's remove button). */
  topRight?: React.ReactNode;
  /** Click/keyboard toggle — renders the card as a button-role element. */
  onSelect?: () => void;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
  labelClassName?: string;
  /** Inline style on the thumbnail frame (e.g. split's segment tint). */
  frameStyle?: React.CSSProperties;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">) {
  const defaultBadge = selected ? (
    <span
      className={cx(
        "absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white",
        tone === "danger" ? "bg-[#f87171]" : "bg-[color:var(--accent)]",
      )}
    >
      {tone === "danger" ? "✕" : "✓"}
    </span>
  ) : null;

  return (
    <ThumbCard
      selected={selected}
      tone={tone}
      interactive={Boolean(onSelect)}
      className={className}
      thumb={
        <div className="absolute inset-0" style={frameStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={cx("h-full w-full object-contain", dim && "opacity-60", imgClassName)}
            style={imgStyle}
            draggable={false}
          />
        </div>
      }
      topLeft={badge}
      topRight={topRight !== undefined ? topRight : defaultBadge}
      label={
        <span className={cx("block truncate text-center text-[11px]", labelClassName ?? "text-[color:var(--muted)]")}>
          {pageLabel}
        </span>
      }
      {...(onSelect
        ? {
            role: "button",
            tabIndex: 0,
            "aria-pressed": selected,
            onClick: onSelect,
            onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            },
          }
        : {})}
      {...rest}
    />
  );
}
