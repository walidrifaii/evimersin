"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/constants/routes";
import { CategoriesPanel } from "@/features/dashboard/components/lookups/CategoriesPanel";
import { CitiesPanel } from "@/features/dashboard/components/lookups/CitiesPanel";
import { PurposesPanel } from "@/features/dashboard/components/lookups/PurposesPanel";
import { ProductsPanel } from "@/features/dashboard/components/lookups/ProductsPanel";
import { SettingsPanel } from "@/features/dashboard/components/SettingsPanel";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = tabParam ?? "overview";

  useEffect(() => {
    if (!tabParam) {
      router.replace(routes.dashboardTab("overview"));
      return;
    }
    if (tabParam === "countries") {
      router.replace(routes.dashboardTab("cities"));
    }
  }, [router, tabParam]);

  if (!tabParam || tabParam === "countries") {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Loading...
      </div>
    );
  }

  switch (tab) {
    case "overview":
      return <DashboardOverview />;
    case "cities":
      return <CitiesPanel />;
    case "categories":
      return <CategoriesPanel />;
    case "purposes":
      return <PurposesPanel />;
    case "products":
      return <ProductsPanel />;
    case "settings":
      return <SettingsPanel />;
    default:
      return <DashboardOverview />;
  }
}
