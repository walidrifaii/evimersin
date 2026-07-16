import Link from "next/link";
import type { PropertyTypeCardItem } from "@/features/home/data";

type PropertyTypeCardProps = {
  item: PropertyTypeCardItem;
  compact?: boolean;
  label?: string;
};

export function PropertyTypeCard({
  item,
  compact = false,
  label,
}: PropertyTypeCardProps) {
  const { Icon, title, subtitle, href } = item;
  const displayLabel = label ?? title;

  return (
    <Link
      href={href}
      className={`group flex flex-col items-center justify-center text-center transition-transform duration-300 hover:-translate-y-1 ${
        compact
          ? "min-h-[5.9rem] gap-2 rounded-none bg-transparent px-2 py-3 shadow-none"
          : "min-h-[15rem] gap-4 rounded-2xl bg-white px-5 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] md:min-h-[8.5rem] md:gap-3 md:px-3 md:py-5 lg:min-h-[17rem] lg:gap-5 lg:px-5 lg:py-12"
      }`}
    >
      <Icon
        className={`text-[var(--brand-blue)] transition-transform duration-300 group-hover:scale-105 ${
          compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-14 w-14 md:h-10 md:w-10 lg:h-16 lg:w-16"
        }`}
      />
      <span
        className={`font-bold text-[var(--brand-navy)] ${
          compact
            ? "text-[0.78rem] leading-tight sm:text-[0.95rem]"
            : "text-[1.25rem] md:text-[1.05rem] lg:text-[1.375rem]"
        }`}
      >
        {displayLabel}
      </span>
      <span
        className={`text-[0.9375rem] font-normal text-[var(--muted)] ${
          compact ? "hidden" : "md:hidden lg:block lg:text-[1rem]"
        }`}
      >
        {subtitle}
      </span>
    </Link>
  );
}
