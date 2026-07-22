"use client";

import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { HotDealsPanel } from "@/features/dashboard/components/HotDealsPanel";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { ListingsByTypeChart } from "@/features/dashboard/components/ListingsByTypeChart";
import { ListingsTable } from "@/features/dashboard/components/ListingsTable";
import { OverviewHero } from "@/features/dashboard/components/OverviewHero";
import {
  FeaturedPropertiesPanel,
  HotDealsPreview,
  WebsiteStatusPanel,
} from "@/features/dashboard/components/OverviewWebsitePanels";
import { PurposeMixChart } from "@/features/dashboard/components/PurposeMixChart";
import { ViewsChart } from "@/features/dashboard/components/ViewsChart";
import { getApiErrorMessage } from "@/store/api/errors";
import { useGetDashboardAnalyticsQuery } from "@/store/slices/admin";

export function DashboardOverview() {
  const { data, isLoading, error, isFetching } = useGetDashboardAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Loading website overview...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-8 text-[14px] font-medium text-[#b91c1c]">
        {getApiErrorMessage(error) || "Failed to load dashboard analytics"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewHero kpis={data.kpis} />

      {isFetching ? (
        <p className="text-[12px] font-medium text-[var(--muted)]">
          Refreshing live data...
        </p>
      ) : null}

      <KpiCards items={data.kpis} />

      <FeaturedPropertiesPanel items={data.featuredProducts} />

      <HotDealsPreview items={data.hotDeals} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ViewsChart data={data.productsByDay} />
        </div>
        <div>
          <PurposeMixChart data={data.productsByPurpose} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ListingsByTypeChart data={data.productsByCategory} />
        <WebsiteStatusPanel summary={data.summary} />
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
