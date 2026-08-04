"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/constants/routes";
import { AccountSecurityPanel } from "@/features/dashboard/components/AccountSecurityPanel";
import { AnnouncementsPanel } from "@/features/dashboard/components/AnnouncementsPanel";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { CategoriesPanel } from "@/features/dashboard/components/lookups/CategoriesPanel";
import { CitiesPanel } from "@/features/dashboard/components/lookups/CitiesPanel";
import { RegionsPanel } from "@/features/dashboard/components/lookups/RegionsPanel";
import { ProductsPanel } from "@/features/dashboard/components/lookups/ProductsPanel";
import { PurposesPanel } from "@/features/dashboard/components/lookups/PurposesPanel";
import { HeroSlidesPanel } from "@/features/dashboard/components/HeroSlidesPanel";
import { SettingsPanel } from "@/features/dashboard/components/SettingsPanel";
import { UsersPanel } from "@/features/dashboard/components/UsersPanel";
import { isDashboardTab } from "@/features/dashboard/data";
import { usePermissions } from "@/hooks/usePermissions";
import { canAccessTab, getFirstAllowedTab } from "@/lib/auth/permissions";

export function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { permissions, canAccessTab: canAccess } = usePermissions();

  useEffect(() => {
    if (permissions === undefined) return;

    const fallbackTab = getFirstAllowedTab(permissions);

    if (!tabParam || tabParam === "countries" || tabParam === "account-security") {
      const legacyTarget =
        tabParam === "countries"
          ? "cities"
          : tabParam === "account-security"
            ? "security"
            : null;

      const next =
        legacyTarget && canAccessTab(permissions, legacyTarget)
          ? legacyTarget
          : fallbackTab;

      router.replace(routes.dashboardTab(next));
      return;
    }

    if (isDashboardTab(tabParam) && !canAccessTab(permissions, tabParam)) {
      router.replace(routes.dashboardTab(fallbackTab));
    }
  }, [permissions, router, tabParam]);

  if (permissions === undefined) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Loading...
      </div>
    );
  }

  if (!isDashboardTab(tabParam) || !canAccess(tabParam)) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Redirecting...
      </div>
    );
  }

  switch (tabParam) {
    case "overview":
      return <DashboardOverview />;
    case "announcements":
      return <AnnouncementsPanel />;
    case "cities":
      return <CitiesPanel />;
    case "regions":
      return <RegionsPanel />;
    case "categories":
      return <CategoriesPanel />;
    case "purposes":
      return <PurposesPanel />;
    case "products":
      return <ProductsPanel />;
    case "users":
      return <UsersPanel />;
    case "hero-slides":
      return <HeroSlidesPanel />;
    case "security":
      return <AccountSecurityPanel />;
    case "settings":
      return <SettingsPanel />;
    default:
      return <DashboardOverview />;
  }
}
