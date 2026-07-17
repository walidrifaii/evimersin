"use client";

import Link from "next/link";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { HotDealsPanel } from "@/features/dashboard/components/HotDealsPanel";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { ListingsByTypeChart } from "@/features/dashboard/components/ListingsByTypeChart";
import { ListingsTable } from "@/features/dashboard/components/ListingsTable";
import { ViewsChart } from "@/features/dashboard/components/ViewsChart";
import { routes } from "@/constants/routes";
import { getApiErrorMessage } from "@/store/api/errors";
import { useGetDashboardAnalyticsQuery } from "@/store/slices/admin";

export function DashboardOverview() {
  const { data, isLoading, error } = useGetDashboardAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-8 text-[14px] font-medium text-[#b91c1c]">
        {getApiErrorMessage(error) || "Failed to load analytics"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-blue)]">
            Overview
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)] sm:text-[2rem]">
            Market pulse from your live inventory
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)] sm:text-[15px]">
            Track active residential units, hot deals, and category mix based on what is
            published on the website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.dashboardTab("products")}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#d7dee8] bg-white px-4 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc]"
          >
            View residential units
          </Link>
          <Link
            href={routes.lookupNew("products")}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
          >
            New residential unit
          </Link>
        </div>
      </div>

      <KpiCards items={data.kpis} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ViewsChart data={data.productsByDay} />
        </div>
        <div className="xl:col-span-2">
          <ListingsByTypeChart data={data.productsByCategory} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ListingsTable items={data.recentProducts} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <HotDealsPanel items={data.hotDeals} />
          <ActivityFeed items={data.activity} />
        </div>
      </div>
    </div>
  );
}
