"use client";

import { AdminSecuritySettings } from "@/features/dashboard/components/AdminSecuritySettings";
import { useAppSelector } from "@/store/hooks";

export function AccountSecurityPanel() {
  const admin = useAppSelector((state) => state.auth.admin);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-blue)]">
          Security
        </p>
        <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
          Change password & email
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
          Update your admin password and email with a 2-step OTP verification
          {admin?.email ? (
            <>
              . Current email:{" "}
              <span className="font-semibold text-[var(--brand-navy)]">
                {admin.email}
              </span>
            </>
          ) : (
            "."
          )}
        </p>
      </div>

      <AdminSecuritySettings />
    </div>
  );
}
