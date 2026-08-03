"use client";

import { useEffect } from "react";
import { HiBell, HiCheckCircle } from "react-icons/hi";
import {
  listenForForegroundMessages,
  type FirebaseClientConfig,
} from "@/lib/firebase/client";
import { getNotificationIconUrl } from "@/lib/firebase/notification-icon";
import { useEnableAdminNotifications } from "@/hooks/useEnableAdminNotifications";
import { useGetFcmTokensQuery } from "@/store/slices/admin/fcmApi";

export function FcmNotificationSetup() {
  const { data, isLoading } = useGetFcmTokensQuery();
  const { enable, error, message, isLoading: enabling, clearFeedback } =
    useEnableAdminNotifications();

  useEffect(() => {
    if (!data?.enabled || !data.config) return;

    let unsubscribe = () => {};

    listenForForegroundMessages(data.config as FirebaseClientConfig, (payload) => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(payload.title ?? "EviMersin", {
            body: payload.body ?? "New website visitor",
            icon: getNotificationIconUrl(),
          });
        }
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => unsubscribe();
  }, [data?.config, data?.enabled]);

  async function enableNotifications() {
    clearFeedback();

    if (!data?.enabled || !data.config || !data.vapidKey) {
      return;
    }

    await enable({
      config: data.config as FirebaseClientConfig,
      vapidKey: data.vapidKey,
    });
  }

  if (isLoading) return null;

  const isEnabled = (data?.tokens?.length ?? 0) > 0;

  return (
    <div className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eff6ff] text-[var(--brand-blue)]">
          <HiBell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.05rem] font-bold text-[var(--brand-navy)]">
            Visitor notifications
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--muted)]">
            Get a Firebase push notification when a new guest opens the website.
            Each browser session is counted once every 30 minutes.
          </p>

          {!data?.enabled ? (
            <p className="mt-3 text-[13px] font-medium text-[#b45309]">
              Add Firebase keys in your environment to enable this feature.
            </p>
          ) : null}

          {message ? (
            <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#15803d]">
              <HiCheckCircle className="h-4 w-4" aria-hidden="true" />
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-3 text-[13px] font-medium text-[var(--brand-red)]">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={enableNotifications}
            disabled={!data?.enabled || enabling || isEnabled}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand-blue)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnabled
              ? "Notifications enabled"
              : enabling
                ? "Enabling..."
                : "Enable notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
