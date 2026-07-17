"use client";

import Image from "next/image";
import Link from "next/link";
import { routes } from "@/constants/routes";
import { toDisplayImageSrc } from "@/lib/image-url";
import { formatProductPrice } from "@/lib/product-pricing";
import type { AnalyticsProductRow } from "@/store/slices/admin";

type ListingsTableProps = {
  items: AnalyticsProductRow[];
};

export function ListingsTable({ items }: ListingsTableProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#eef2f7] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
            Recent Residential Units
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Latest residential units published to the website
          </p>
        </div>
        <Link
          href={routes.lookupNew("products")}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-blue)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Add residential unit
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No residential units yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead className="bg-[#f8fafc] text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3 font-semibold sm:px-6">Property</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Deal</th>
                <th className="px-5 py-3 font-semibold sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const imageSrc = toDisplayImageSrc(item.image);
                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#eef2f7] transition-colors hover:bg-[#fafbfd]"
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-[#eef2f7]">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={item.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--brand-navy)]">
                            {item.name}
                          </p>
                          <p className="truncate text-[12px] text-[var(--muted)]">
                            {item.city_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--brand-navy)]">
                      {item.category_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          item.status === 1
                            ? "bg-[#ecfdf5] text-[#059669]"
                            : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--brand-navy)]">
                      <div className="flex flex-col">
                        <span>{formatProductPrice(item.final_price)}</span>
                        {item.is_hot_deal ? (
                          <span className="text-[11px] font-medium text-[var(--muted)] line-through">
                            {formatProductPrice(item.price)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          item.is_hot_deal
                            ? "bg-[#fff7ed] text-[#c2410c]"
                            : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                      >
                        {item.is_hot_deal ? "Hot deal" : "Standard"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <Link
                        href={routes.lookupEdit("products", item.id)}
                        className="cursor-pointer font-semibold text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
