"use client";

import Image from "next/image";
import Link from "next/link";
import { config } from "@/constants/config";
import { routes } from "@/constants/routes";
import { toDisplayImageSrc } from "@/lib/image-url";
import { formatProductPrice } from "@/lib/product-pricing";
import type { AnalyticsProductRow } from "@/store/slices/admin";

type OverviewPropertyCardProps = {
  item: AnalyticsProductRow;
  badge: string;
  badgeClassName: string;
};

function OverviewPropertyCard({
  item,
  badge,
  badgeClassName,
}: OverviewPropertyCardProps) {
  const imageSrc = toDisplayImageSrc(item.image);

  return (
    <Link
      href={routes.property(String(item.id))}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#e8edf5] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#eef2f7]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(max-width: 1280px) 82vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span
          className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white ${badgeClassName}`}
        >
          {badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--brand-navy)]">
            {item.name}
          </h3>
          <p className="mt-1 truncate text-[13px] text-[var(--muted)]">
            {item.city_name}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-[17px] font-bold text-[var(--brand-blue)]">
            {formatProductPrice(item.final_price)}
          </span>
          {item.is_hot_deal ? (
            <span className="text-[12px] font-medium text-[var(--muted)] line-through">
              {formatProductPrice(item.price)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

type FeaturedPropertiesPanelProps = {
  items: AnalyticsProductRow[];
};

export function FeaturedPropertiesPanel({ items }: FeaturedPropertiesPanelProps) {
  if (items.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e8edf5] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#eef2f7] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-blue)]">
            Website preview
          </p>
          <h2 className="mt-1 text-[1.35rem] font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.5rem]">
            Featured Properties
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Same listings shown on the homepage Featured Properties section
          </p>
        </div>
        <Link
          href={routes.home}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--brand-blue)] px-4 text-[13px] font-semibold text-[var(--brand-blue)] transition-colors hover:bg-[#eff6ff]"
        >
          View homepage
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6">
        {items.map((item) => (
          <OverviewPropertyCard
            key={item.id}
            item={item}
            badge="Featured"
            badgeClassName="bg-[var(--brand-blue)]"
          />
        ))}
      </div>
    </section>
  );
}

type HotDealsPreviewProps = {
  items: AnalyticsProductRow[];
};

export function HotDealsPreview({ items }: HotDealsPreviewProps) {
  if (items.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[24px] bg-[var(--brand-navy)] shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/70">
            Website preview
          </p>
          <h2 className="mt-1 text-[1.35rem] font-bold tracking-[-0.02em] text-white sm:text-[1.5rem]">
            Hot Deals
          </h2>
          <p className="mt-1 text-[13px] text-white/70">
            Discounted listings from the homepage Hot Deals section
          </p>
        </div>
        <Link
          href={routes.properties}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-white/70 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          View all deals
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6">
        {items.map((item) => (
          <OverviewPropertyCard
            key={item.id}
            item={item}
            badge="Hot Deal"
            badgeClassName="bg-[var(--brand-red)]"
          />
        ))}
      </div>
    </section>
  );
}

type WebsiteStatusPanelProps = {
  summary: {
    countries: number;
    cities: number;
    categories: number;
    purposes: number;
    featured: number;
    hotDeals: number;
    inactive: number;
  };
};

const quickLinks = [
  { label: "Homepage", href: routes.home },
  { label: "All Properties", href: routes.properties },
  { label: "Contact Page", href: routes.contact },
  { label: "Website Settings", href: routes.dashboardTab("settings") },
] as const;

const manageLinks = [
  { label: "Cities", href: routes.dashboardTab("cities"), countKey: "cities" as const },
  { label: "Categories", href: routes.dashboardTab("categories"), countKey: "categories" as const },
  { label: "Purposes", href: routes.dashboardTab("purposes"), countKey: "purposes" as const },
] as const;

export function WebsiteStatusPanel({ summary }: WebsiteStatusPanelProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
          Public website
        </h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Quick links to {config.appName} pages your visitors see
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.href.startsWith("/dashboard") ? undefined : "_blank"}
              rel={link.href.startsWith("/dashboard") ? undefined : "noopener noreferrer"}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#e8edf5] bg-[#f8fafc] px-4 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-blue)] hover:bg-[#eff6ff] hover:text-[var(--brand-blue)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
          Website data
        </h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Lookup values powering search filters on the homepage
        </p>
        <ul className="mt-4 space-y-2">
          {manageLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-[#eef2f7] bg-[#f8fafc] px-4 py-3 transition-colors hover:bg-[#eff6ff]"
              >
                <span className="text-[13px] font-semibold text-[var(--brand-navy)]">
                  {link.label}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[var(--brand-blue)]">
                  {summary[link.countKey]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-[var(--muted)]">
          {summary.inactive} inactive listing{summary.inactive === 1 ? "" : "s"} not shown on the website.
        </p>
      </div>
    </section>
  );
}
