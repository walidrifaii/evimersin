"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HiBell, HiExclamationCircle, HiX } from "react-icons/hi";
import logoImage from "@/assets/images/logo.png";
import {
  ADMIN_FCM_LOGIN_PROMPT_KEY,
  useEnableAdminNotifications,
} from "@/hooks/useEnableAdminNotifications";
import { useGetFcmTokensQuery } from "@/store/slices/admin/fcmApi";

export function AdminNotificationPrompt() {
  const { data, isLoading, isFetching } = useGetFcmTokensQuery();
  const { enable, isLoading: enabling, error } = useEnableAdminNotifications();
  const [open, setOpen] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);
  const handledLoginPrompt = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoading || isFetching) return;
    if (handledLoginPrompt.current) return;

    const shouldPrompt =
      sessionStorage.getItem(ADMIN_FCM_LOGIN_PROMPT_KEY) === "1";
    if (!shouldPrompt) return;

    handledLoginPrompt.current = true;
    sessionStorage.removeItem(ADMIN_FCM_LOGIN_PROMPT_KEY);

    if (!data?.enabled || !data.config || !data.vapidKey) {
      setConfigMissing(true);
      return;
    }

    if (!("Notification" in window)) {
      setConfigMissing(true);
      return;
    }

    if (Notification.permission === "granted") {
      void enable({
        config: data.config,
        vapidKey: data.vapidKey,
      });
      return;
    }

    if (Notification.permission === "default") {
      setOpen(true);
      return;
    }

    if (Notification.permission === "denied") {
      setConfigMissing(true);
    }
  }, [data, enable, isFetching, isLoading]);

  if (configMissing) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-[460px] rounded-[24px] border border-[#e8eef6] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <button
            type="button"
            onClick={() => setConfigMissing(false)}
            className="absolute right-4 top-4 rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-[#f1f5f9]"
            aria-label="Close"
          >
            <HiX className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef2f2] text-[#b91c1c]">
              <HiExclamationCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-[1.15rem] font-bold text-[var(--brand-navy)]">
              {!data?.enabled
                ? "Push notifications not configured"
                : "Notifications blocked or unavailable"}
            </h2>
            {!data?.enabled ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-left text-[13px] text-[var(--muted)]">
                <li>
                  Set <code className="text-[12px]">NEXT_PUBLIC_FIREBASE_VAPID_KEY</code>{" "}
                  on your server.
                </li>
                <li>Redeploy / restart after saving env vars.</li>
                <li>Log in again and enable notifications in Settings.</li>
              </ol>
            ) : (
              <p className="mt-2 text-left text-[14px] leading-relaxed text-[var(--muted)]">
                Allow notifications in your browser site settings, then go to{" "}
                <strong>Dashboard → Settings → Enable notifications</strong>.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setConfigMissing(false)}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--brand-blue)] text-[14px] font-semibold text-white"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

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
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-[#f1f5f9]"
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
            Click Allow below, then Allow in your browser. That saves your FCM
            token to the database.
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
            disabled={enabling}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enabling ? "Enabling..." : "Allow notifications"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={enabling}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#dbe3ef] bg-white text-[14px] font-semibold text-[var(--brand-navy)]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
