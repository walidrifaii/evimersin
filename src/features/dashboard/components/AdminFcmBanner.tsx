"use client";

import Link from "next/link";
import { HiBell } from "react-icons/hi";
import { routes } from "@/constants/routes";
import { useGetFcmTokensQuery } from "@/store/slices/admin/fcmApi";

export function AdminFcmBanner() {
  const { data, isLoading } = useGetFcmTokensQuery();

  if (isLoading) return null;

  const hasToken = (data?.tokens?.length ?? 0) > 0;
  if (hasToken || !data?.enabled) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--brand-blue)]">
          <HiBell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
            Visitor notifications are not enabled on this browser
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            Open Settings, click Enable notifications, then Allow in your browser
            to save your FCM token.
          </p>
        </div>
      </div>
      <Link
        href={`${routes.dashboard}?tab=settings`}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-blue)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
      >
        Open Settings
      </Link>
    </div>
  );
}
