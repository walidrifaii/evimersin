import {
  ALL_PERMISSIONS,
  SUPER_ADMIN_PERMISSION,
  type Permission,
} from "@/constants/permissions";

const MUTATION_ACTIONS = ["create", "update", "delete", "write"] as const;

function moduleFromPermission(permission: string) {
  return permission.split(":")[0] ?? "";
}

function actionFromPermission(permission: string) {
  return permission.split(":")[1] ?? "";
}

function hasResourceAction(
  permissions: string[],
  resource: string,
  actions: readonly string[],
) {
  return actions.some(
    (action) =>
      permissions.includes(`${resource}:${action}`) ||
      (action !== "write" && permissions.includes(`${resource}:write`)),
  );
}

export function hasPermission(
  permissions: string[] | undefined | null,
  required: Permission | string,
) {
  if (!permissions?.length) return false;
  if (permissions.includes(SUPER_ADMIN_PERMISSION)) return true;
  if (permissions.includes(required)) return true;

  const [resource, action] = required.split(":");
  if (!resource || !action) return false;

  if (action === "write") {
    return hasResourceAction(permissions, resource, MUTATION_ACTIONS);
  }

  if (action === "read") {
    return hasResourceAction(permissions, resource, ["read", ...MUTATION_ACTIONS]);
  }

  if (permissions.includes(`${resource}:write`)) {
    return true;
  }

  return false;
}

export function canAccessTab(
  permissions: string[] | undefined | null,
  tabId: string,
) {
  if (tabId === "security") return true;
  if (!permissions?.length) return false;
  if (permissions.includes(SUPER_ADMIN_PERMISSION)) return true;

  return hasPermission(permissions, `${tabId}:read`);
}

export function getFirstAllowedTab(permissions: string[] | undefined | null) {
  const tabOrder = [
    "overview",
    "announcements",
    "products",
    "categories",
    "cities",
    "regions",
    "purposes",
    "users",
    "settings",
    "security",
  ];

  for (const tabId of tabOrder) {
    if (canAccessTab(permissions, tabId)) return tabId;
  }

  return "security";
}

export function permissionCount(permissions: string[] | undefined | null) {
  if (!permissions?.length) return 0;
  if (permissions.includes(SUPER_ADMIN_PERMISSION)) return ALL_PERMISSIONS.length;
  return permissions.length;
}

export function summarizePermissions(permissions: string[] | undefined | null) {
  if (!permissions?.length) return "No access";
  if (permissions.includes(SUPER_ADMIN_PERMISSION)) return "Full access";

  const modules = new Set(
    permissions.map((permission) => moduleFromPermission(permission)).filter(Boolean),
  );

  if (modules.size === 0) return "No access";
  if (modules.size <= 2) return `${modules.size} area${modules.size > 1 ? "s" : ""}`;
  return `${modules.size} areas`;
}

export function togglePermission(
  current: string[],
  permission: string,
  checked: boolean,
) {
  const set = new Set(current);
  if (checked) {
    set.add(permission);
    const [moduleId, action] = permission.split(":");
    if (action && action !== "read") {
      set.add(`${moduleId}:read`);
    }
  } else {
    set.delete(permission);
    const [moduleId, action] = permission.split(":");
    if (action === "read") {
      for (const item of [...set]) {
        if (item.startsWith(`${moduleId}:`) && actionFromPermission(item) !== "read") {
          set.delete(item);
        }
      }
    }
  }
  return [...set];
}

export function toggleModulePermissions(
  current: string[],
  moduleId: string,
  actions: readonly string[],
  checked: boolean,
) {
  let next = current;
  for (const action of actions) {
    next = togglePermission(next, `${moduleId}:${action}`, checked);
  }
  return next;
}
