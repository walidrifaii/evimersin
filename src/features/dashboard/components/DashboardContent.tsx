"use client";

import { useSearchParams } from "next/navigation";
import { CategoriesPanel } from "@/features/dashboard/components/lookups/CategoriesPanel";
import { CitiesPanel } from "@/features/dashboard/components/lookups/CitiesPanel";
import { CountriesPanel } from "@/features/dashboard/components/lookups/CountriesPanel";
import { PurposesPanel } from "@/features/dashboard/components/lookups/PurposesPanel";
import { ProductsPanel } from "@/features/dashboard/components/lookups/ProductsPanel";
import { SettingsPanel } from "@/features/dashboard/components/SettingsPanel";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "overview";

  switch (tab) {
    case "countries":
      return <CountriesPanel />;
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
