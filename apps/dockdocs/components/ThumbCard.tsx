"use client";

/**
 * ThumbCard — shared base shell for every thumbnail card family
 * (file cards = BatchFileCard, page cards = PageCard, preview cards).
 *
 * Owns the common chrome only: rounded --line border, square neutral-bg
 * thumbnail frame (object-contain content), label area below, top-left /
 * top-right slots, selected border + interactive hover. Family-specific
 * semantics (status badges, drag, rotation, tints) stay in the family
 * component — share the shell, not a monster card.
 */

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ThumbCard({
  thumb,
  label,
  topLeft,
  topRight,
  selected = false,
  tone = "accent",
  interactive = false,
  className,
  frameClassName,
  ...rest
}: {
  /** Content of the square thumbnail frame (img / canvas / fallback). */
  thumb: React.ReactNode;
  /** Content of the label area below the frame (omit to render frame only). */
  label?: React.ReactNode;
  /** Slot rendered at absolute left-1.5 top-1.5 inside the frame (e.g. order badge). */
  topLeft?: React.ReactNode;
  /** Slot rendered raw as a direct child of the shell — position itself (e.g. absolute right-1 top-1 remove button or ✓ badge). */
  topRight?: React.ReactNode;
  /** Selected state: tone border replaces the --line border. */
  selected?: boolean;
  /** Border/badge color family for the selected state. */
  tone?: "accent" | "danger";
  /** Clickable/selectable card: pointer cursor + hover border feedback. */
  interactive?: boolean;
  className?: string;
  /** Extra classes on the thumbnail frame (e.g. a segment tint). */
  frameClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const border = selected
    ? tone === "danger"
      ? "border-[#f87171]"
      : "border-[color:var(--accent)]"
    : "border-[color:var(--line)]";
  return (
    <div
      className={cx(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius)] border",
        border,
        "bg-[color:var(--surface)]",
        interactive && "cursor-pointer transition",
        interactive && !selected && "hover:border-[color:var(--line-strong)]",
        className,
      )}
      {...rest}
    >
      <div className={cx("relative aspect-square w-full overflow-hidden bg-[color:var(--surface-subtle)]", frameClassName)}>
        {thumb}
        {topLeft && <div className="absolute left-1.5 top-1.5">{topLeft}</div>}
      </div>
      {label !== undefined && <div className="flex flex-1 flex-col px-2.5 py-2">{label}</div>}
      {topRight}
    </div>
  );
}
