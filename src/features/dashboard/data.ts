import { routes } from "@/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
};

export const dashboardNav: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: routes.dashboard },
  { id: "countries", label: "Countries", href: `${routes.dashboard}?tab=countries` },
  { id: "cities", label: "Cities", href: `${routes.dashboard}?tab=cities` },
  { id: "categories", label: "Categories", href: `${routes.dashboard}?tab=categories` },
  { id: "purposes", label: "Purposes", href: `${routes.dashboard}?tab=purposes` },
  { id: "products", label: "Residential Units", href: `${routes.dashboard}?tab=products` },
  { id: "settings", label: "Settings", href: `${routes.dashboard}?tab=settings` },
];

export const dashboardAgent = {
  name: "Admin User",
  role: "Property Manager",
  email: "admin@evimersin.com",
};
