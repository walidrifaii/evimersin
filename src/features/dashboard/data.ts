import { routes } from "@/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
};

export const DASHBOARD_TABS = [
  "overview",
  "announcements",
  "products",
  "categories",
  "cities",
  "regions",
  "purposes",
  "security",
  "settings",
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number];

export function isDashboardTab(value: string | null | undefined): value is DashboardTabId {
  return !!value && (DASHBOARD_TABS as readonly string[]).includes(value);
}

export const dashboardNav: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: routes.dashboardTab("overview") },
  { id: "announcements", label: "Announcements", href: routes.dashboardTab("announcements") },
  { id: "products", label: "Residential Units", href: routes.dashboardTab("products") },
  { id: "categories", label: "Categories", href: routes.dashboardTab("categories") },
  { id: "cities", label: "Cities", href: routes.dashboardTab("cities") },
  { id: "regions", label: "Regions", href: routes.dashboardTab("regions") },
  { id: "purposes", label: "Purposes", href: routes.dashboardTab("purposes") },
  { id: "security", label: "Change Password", href: routes.dashboardTab("security") },
  { id: "settings", label: "Settings", href: routes.dashboardTab("settings") },
];

export const dashboardAgent = {
  name: "Admin User",
  role: "Property Manager",
  email: "admin@evimersin.com",
};
