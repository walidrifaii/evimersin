"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { canAccessTab, getFirstAllowedTab, hasPermission } from "@/lib/auth/permissions";

type RequireDashboardAccessProps = {
  children: ReactNode;
  /** Dashboard tab id, e.g. "products" — requires `{tab}:read` */
  tab?: string;
  /** Specific permission key, e.g. "products:create" */
  permission?: string;
};

export function RequireDashboardAccess({
  children,
  tab,
  permission,
}: RequireDashboardAccessProps) {
  const router = useRouter();
  const { permissions } = usePermissions();

  const tabAllowed = tab ? canAccessTab(permissions, tab) : true;
  const permissionAllowed = permission
    ? hasPermission(permissions, permission)
    : true;
  const allowed = tabAllowed && permissionAllowed;

  useEffect(() => {
    if (permissions === undefined) return;
    if (!allowed) {
      router.replace(routes.dashboardTab(getFirstAllowedTab(permissions)));
    }
  }, [allowed, permissions, router]);

  if (permissions === undefined) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Loading...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
