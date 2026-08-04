import { useAppSelector } from "@/store/hooks";
import { canAccessTab, hasPermission } from "@/lib/auth/permissions";

export function usePermissions() {
  const permissions = useAppSelector((state) => state.auth.admin?.permissions);

  return {
    permissions,
    can: (permission: string) => hasPermission(permissions, permission),
    canAccessTab: (tabId: string) => canAccessTab(permissions, tabId),
  };
}
