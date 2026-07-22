import Link from "next/link";
import { config } from "@/constants/config";
import { routes } from "@/constants/routes";
import type { AnalyticsKpi } from "@/store/slices/admin";

type OverviewHeroProps = {
  kpis: AnalyticsKpi[];
};

export function OverviewHero({ kpis }: OverviewHeroProps) {
  const activeListings = kpis.find((item) => item.id === "active-products")?.value ?? "0";
  const featured = kpis.find((item) => item.id === "featured-products")?.value ?? "0";

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[var(--brand-navy)] px-5 py-8 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.35), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(227, 28, 35, 0.25), transparent 40%),
            radial-gradient(circle at 80% 85%, rgba(37, 99, 235, 0.2), transparent 35%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
            {config.appName} Dashboard
          </p>
          <h1 className="mt-2 text-[1.85rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.25rem]">
            Manage your live property website
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
            Track listings, featured properties, hot deals, and website filters from one
            overview connected to your live inventory.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-[13px]">
            <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold">
              {activeListings} active listings
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 font-semibold">
              {featured} featured on homepage
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.home}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
          >
            View website
          </Link>
          <Link
            href={routes.lookupNew("products")}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
          >
            Add listing
          </Link>
          <Link
            href={routes.dashboardTab("settings")}
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-white/90"
          >
            Website settings
          </Link>
        </div>
      </div>
    </section>
  );
}
