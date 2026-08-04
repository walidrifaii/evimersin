export const PERMISSION_ACTIONS = ["read", "create", "update", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionModule = {
  id: string;
  label: string;
  description: string;
  actions: readonly PermissionAction[];
};

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Dashboard stats and visitor analytics",
    actions: ["read"],
  },
  {
    id: "announcements",
    label: "Announcements",
    description: "Push announcements to guests on the site",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "products",
    label: "Residential units",
    description: "Property listings and media",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "categories",
    label: "Categories",
    description: "Listing categories",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "cities",
    label: "Cities",
    description: "City lookup data",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "regions",
    label: "Regions",
    description: "Region lookup data",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "purposes",
    label: "Purposes",
    description: "Purpose lookup data",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "settings",
    label: "Settings",
    description: "Site configuration",
    actions: ["read", "update"],
  },
  {
    id: "users",
    label: "Users",
    description: "Dashboard accounts and access",
    actions: ["read", "create", "update", "delete"],
  },
  {
    id: "security",
    label: "Change password",
    description: "Own account security",
    actions: ["read"],
  },
];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  read: "View",
  create: "Add",
  update: "Edit",
  delete: "Delete",
};

function buildPermissionKey(moduleId: string, action: PermissionAction) {
  return `${moduleId}:${action}`;
}

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((module) =>
  module.actions.map((action) => buildPermissionKey(module.id, action)),
);

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSIONS = {
  OVERVIEW_READ: "overview:read",
  ANNOUNCEMENTS_READ: "announcements:read",
  ANNOUNCEMENTS_WRITE: "announcements:write",
  ANNOUNCEMENTS_CREATE: "announcements:create",
  ANNOUNCEMENTS_UPDATE: "announcements:update",
  ANNOUNCEMENTS_DELETE: "announcements:delete",
  PRODUCTS_READ: "products:read",
  PRODUCTS_WRITE: "products:write",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",
  CATEGORIES_READ: "categories:read",
  CATEGORIES_WRITE: "categories:write",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",
  CITIES_READ: "cities:read",
  CITIES_WRITE: "cities:write",
  CITIES_CREATE: "cities:create",
  CITIES_UPDATE: "cities:update",
  CITIES_DELETE: "cities:delete",
  REGIONS_READ: "regions:read",
  REGIONS_WRITE: "regions:write",
  REGIONS_CREATE: "regions:create",
  REGIONS_UPDATE: "regions:update",
  REGIONS_DELETE: "regions:delete",
  PURPOSES_READ: "purposes:read",
  PURPOSES_WRITE: "purposes:write",
  PURPOSES_CREATE: "purposes:create",
  PURPOSES_UPDATE: "purposes:update",
  PURPOSES_DELETE: "purposes:delete",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  SETTINGS_UPDATE: "settings:update",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  SECURITY_READ: "security:read",
} as const;

export const SUPER_ADMIN_PERMISSION = "*";

export const PERMISSION_PRESETS: Record<
  string,
  { label: string; description: string; permissions: string[] }
> = {
  viewer: {
    label: "Viewer",
    description: "Read-only access to listings and overview",
    permissions: [
      "overview:read",
      "products:read",
      "categories:read",
      "cities:read",
      "regions:read",
      "purposes:read",
      "security:read",
    ],
  },
  editor: {
    label: "Editor",
    description: "Manage content without user or settings access",
    permissions: [
      "overview:read",
      "announcements:read",
      "announcements:create",
      "announcements:update",
      "announcements:delete",
      "products:read",
      "products:create",
      "products:update",
      "products:delete",
      "categories:read",
      "categories:create",
      "categories:update",
      "categories:delete",
      "cities:read",
      "cities:create",
      "cities:update",
      "cities:delete",
      "regions:read",
      "regions:create",
      "regions:update",
      "regions:delete",
      "purposes:read",
      "purposes:create",
      "purposes:update",
      "purposes:delete",
      "security:read",
    ],
  },
  manager: {
    label: "Manager",
    description: "Full dashboard except user management",
    permissions: ALL_PERMISSIONS.filter((item) => !item.startsWith("users:")),
  },
};

export function isValidPermission(value: string) {
  return value === SUPER_ADMIN_PERMISSION || ALL_PERMISSIONS.includes(value);
}

export function normalizePermissions(values: string[] | undefined | null) {
  if (!values?.length) return [];
  const unique = new Set<string>();
  for (const value of values) {
    if (value === SUPER_ADMIN_PERMISSION) return [SUPER_ADMIN_PERMISSION];
    if (isValidPermission(value)) unique.add(value);
  }
  return [...unique];
}
