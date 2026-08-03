"use client";

import { useEffect } from "react";
import { HiBell, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
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

  const hasToken = (data?.tokens?.length ?? 0) > 0;
  const permissionDenied =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "denied";

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
            Get a push notification when a new guest opens the website.
          </p>

          {!data?.enabled ? (
            <div className="mt-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5 text-[13px] text-[#92400e]">
              <p className="font-semibold">Firebase client is not configured.</p>
              <p className="mt-1">
                Set all <code className="text-[12px]">NEXT_PUBLIC_FIREBASE_*</code>{" "}
                values and a real{" "}
                <code className="text-[12px]">NEXT_PUBLIC_FIREBASE_VAPID_KEY</code>{" "}
                in <code className="text-[12px]">.env.local</code>, then restart the
                server.
              </p>
            </div>
          ) : null}

          {data?.enabled && !data.adminReady ? (
            <div className="mt-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5 text-[13px] text-[#92400e]">
              <p className="font-semibold">Server push is not configured yet.</p>
              <p className="mt-1">
                Add <code className="text-[12px]">FIREBASE_CLIENT_EMAIL</code> and{" "}
                <code className="text-[12px]">FIREBASE_PRIVATE_KEY</code> from your
                Firebase service account JSON. Without these, tokens can be saved but
                visitor alerts will not be sent.
              </p>
            </div>
          ) : null}

          {data?.enabled && !hasToken && !permissionDenied ? (
            <p className="mt-3 text-[13px] text-[var(--muted)]">
              After login, click <strong>Allow notifications</strong> and approve the
              browser permission popup. Tokens stay empty until you do that.
            </p>
          ) : null}

          {permissionDenied ? (
            <div className="mt-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[13px] text-[#b91c1c]">
              <p className="flex items-center gap-2 font-semibold">
                <HiExclamationCircle className="h-4 w-4 shrink-0" />
                Notifications are blocked in this browser.
              </p>
              <p className="mt-1">
                Open your browser site settings for this domain and allow
                notifications, then click the button below again.
              </p>
            </div>
          ) : null}

          {hasToken ? (
            <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#15803d]">
              <HiCheckCircle className="h-4 w-4" aria-hidden="true" />
              This admin account has {data?.tokens?.length} registered device
              {data?.tokens?.length === 1 ? "" : "s"}.
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
            disabled={!data?.enabled || enabling || permissionDenied}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand-blue)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasToken
              ? "Re-register this browser"
              : enabling
                ? "Enabling..."
                : "Enable notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
