import {
  DASHBOARD_TAB_PERMISSIONS,
  SUPER_ADMIN_PERMISSION,
  type Permission,
} from "@/constants/permissions";

export function hasPermission(
  permissions: string[] | undefined | null,
  required: Permission | string,
) {
  if (!permissions?.length) return false;
  if (permissions.includes(SUPER_ADMIN_PERMISSION)) return true;
  if (permissions.includes(required)) return true;

  const [resource, action] = required.split(":");
  if (action === "read" && permissions.includes(`${resource}:write`)) {
    return true;
  }

  return false;
}

export function canAccessTab(
  permissions: string[] | undefined | null,
  tabId: string,
) {
  const required = DASHBOARD_TAB_PERMISSIONS[tabId];
  if (!required) return false;
  return hasPermission(permissions, required);
}

export function getFirstAllowedTab(permissions: string[] | undefined | null) {
  for (const tabId of Object.keys(DASHBOARD_TAB_PERMISSIONS)) {
    if (canAccessTab(permissions, tabId)) return tabId;
  }
  return "security";
}
