export const PERMISSIONS = {
  OVERVIEW_READ: "overview:read",
  ANNOUNCEMENTS_READ: "announcements:read",
  ANNOUNCEMENTS_WRITE: "announcements:write",
  PRODUCTS_READ: "products:read",
  PRODUCTS_WRITE: "products:write",
  CATEGORIES_READ: "categories:read",
  CATEGORIES_WRITE: "categories:write",
  CITIES_READ: "cities:read",
  CITIES_WRITE: "cities:write",
  REGIONS_READ: "regions:read",
  REGIONS_WRITE: "regions:write",
  PURPOSES_READ: "purposes:read",
  PURPOSES_WRITE: "purposes:write",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  SECURITY_READ: "security:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const DASHBOARD_TAB_PERMISSIONS: Record<string, Permission> = {
  overview: PERMISSIONS.OVERVIEW_READ,
  announcements: PERMISSIONS.ANNOUNCEMENTS_READ,
  products: PERMISSIONS.PRODUCTS_READ,
  categories: PERMISSIONS.CATEGORIES_READ,
  cities: PERMISSIONS.CITIES_READ,
  regions: PERMISSIONS.REGIONS_READ,
  purposes: PERMISSIONS.PURPOSES_READ,
  settings: PERMISSIONS.SETTINGS_READ,
  users: PERMISSIONS.USERS_READ,
  security: PERMISSIONS.SECURITY_READ,
};

export const SUPER_ADMIN_PERMISSION = "*";
