"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HiBell, HiX } from "react-icons/hi";
import logoImage from "@/assets/images/logo.png";
import {
  ADMIN_FCM_LOGIN_PROMPT_KEY,
  useEnableAdminNotifications,
} from "@/hooks/useEnableAdminNotifications";
import { useGetFcmTokensQuery } from "@/store/slices/admin/fcmApi";

export function AdminNotificationPrompt() {
  const { data } = useGetFcmTokensQuery();
  const { enable, isLoading, error } = useEnableAdminNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!data?.enabled || !data.config || !data.vapidKey) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const shouldPrompt =
      sessionStorage.getItem(ADMIN_FCM_LOGIN_PROMPT_KEY) === "1";
    if (!shouldPrompt) return;

    sessionStorage.removeItem(ADMIN_FCM_LOGIN_PROMPT_KEY);

    if (Notification.permission === "granted") {
      void enable({
        config: data.config,
        vapidKey: data.vapidKey,
      });
      return;
    }

    if (Notification.permission === "default") {
      setOpen(true);
    }
  }, [data?.config, data?.enabled, data?.vapidKey, enable]);

  if (!open || !data?.enabled || !data.config || !data.vapidKey) {
    return null;
  }

  async function handleAllow() {
    const success = await enable({
      config: data!.config!,
      vapidKey: data!.vapidKey!,
    });
    if (success) setOpen(false);
  }

  function handleDismiss() {
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-notification-prompt-title"
    >
      <div className="relative w-full max-w-[420px] rounded-[24px] border border-[#e8eef6] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-[#f1f5f9] hover:text-[var(--brand-navy)]"
          aria-label="Close"
        >
          <HiX className="h-5 w-5" />
        </button>

        <div className="text-center">
          <Image
            src={logoImage}
            alt="EviMersin"
            className="mx-auto h-12 w-auto"
          />
          <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[var(--brand-blue)]">
            <HiBell className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2
            id="admin-notification-prompt-title"
            className="mt-4 text-[1.15rem] font-bold text-[var(--brand-navy)]"
          >
            Enable visitor notifications?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
            Allow notifications to get an alert when a new guest opens the
            website. Click Allow in your browser when prompted.
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAllow}
            disabled={isLoading}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Enabling..." : "Allow notifications"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isLoading}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#dbe3ef] bg-white text-[14px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
