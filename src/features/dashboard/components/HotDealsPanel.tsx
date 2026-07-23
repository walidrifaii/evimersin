"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatProductPrice } from "@/lib/product-pricing";
import type { AnalyticsProductRow } from "@/store/slices/admin";

type HotDealsPanelProps = {
  items: AnalyticsProductRow[];
};

export function HotDealsPanel({ items }: HotDealsPanelProps) {
  return (
    <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
            Hot Deals
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Discounted residential units live on the website
          </p>
        </div>
        <Link
          href={routes.dashboardTab("products")}
          className="cursor-pointer text-[13px] font-semibold text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d5dce8] px-4 py-8 text-center text-[13px] text-[var(--muted)]">
          No discounted residential units yet. Add a discount on a residential unit to show it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={routes.lookupEdit("products", item.id)}
                className="flex items-start gap-3 rounded-xl border border-[#eef2f7] bg-[#f8fafc] p-3.5 transition-colors hover:bg-[#f1f5f9]"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[var(--brand-navy)]">
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">
                    {item.category_name} · {item.city_name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-[13px] font-bold text-[var(--brand-navy)]">
                      {formatProductPrice(item.final_price)}
                    </span>
                    <span className="text-[12px] text-[var(--muted)] line-through">
                      {formatProductPrice(item.price)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
