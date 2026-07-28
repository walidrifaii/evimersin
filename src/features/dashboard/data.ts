import { routes } from "@/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
};

export const dashboardNav: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: routes.dashboardTab("overview") },
  { id: "products", label: "Residential Units", href: routes.dashboardTab("products") },
  { id: "categories", label: "Categories", href: routes.dashboardTab("categories") },
  { id: "cities", label: "Cities", href: routes.dashboardTab("cities") },
  { id: "purposes", label: "Purposes", href: routes.dashboardTab("purposes") },
  { id: "settings", label: "Settings", href: routes.dashboardTab("settings") },
];

export const dashboardAgent = {
  name: "Admin User",
  role: "Property Manager",
  email: "admin@evimersin.com",
};
