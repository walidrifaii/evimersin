import Image from "next/image";
import Link from "next/link";
import type { HotDealItem } from "@/features/home/data";

type HotDealCardProps = {
  item: HotDealItem;
};

export function HotDealCard({ item }: HotDealCardProps) {
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 1280px) 84vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-[var(--brand-red)] px-2.5 py-1 text-[11px] font-bold text-white">
          {item.discount}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-[16px] font-bold leading-snug text-[var(--brand-navy)]">
            {item.title}
          </h3>
          <p className="mt-1 text-[13px] font-normal text-[var(--muted)]">
            {item.location}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-[13px] font-medium text-[#9ca3af] line-through">
            {item.originalPrice}
          </span>
          <span className="text-[18px] font-bold leading-none text-[var(--brand-navy)]">
            {item.salePrice}
          </span>
        </div>
      </div>
    </Link>
  );
}
