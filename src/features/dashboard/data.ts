import { routes } from "@/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
};

export const dashboardNav: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: routes.dashboardTab("overview") },
  { id: "countries", label: "Countries", href: routes.dashboardTab("countries") },
  { id: "cities", label: "Cities", href: routes.dashboardTab("cities") },
  { id: "categories", label: "Categories", href: routes.dashboardTab("categories") },
  { id: "purposes", label: "Purposes", href: routes.dashboardTab("purposes") },
  { id: "products", label: "Residential Units", href: routes.dashboardTab("products") },
  { id: "settings", label: "Settings", href: routes.dashboardTab("settings") },
];

export const dashboardAgent = {
  name: "Admin User",
  role: "Property Manager",
  email: "admin@evimersin.com",
};
