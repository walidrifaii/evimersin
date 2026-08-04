"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  listenForForegroundMessages,
  requestFcmToken,
  type FirebaseClientConfig,
} from "@/lib/firebase/client";

const SESSION_KEY = "evimersin_visit_session";
const FCM_REGISTERED_KEY = "evimersin_guest_fcm_registered";
const PROMPT_DISMISSED_KEY = "evimersin_guest_fcm_prompt_dismissed";

type FcmConfigResponse = {
  success?: boolean;
  data?: {
    enabled: boolean;
    config: FirebaseClientConfig | null;
    vapidKey: string | null;
    vapidKeyError?: string | null;
  };
};

type LiveAnnouncement = {
  title: string;
  message: string;
};

type PromptStatus = "idle" | "loading" | "denied" | "error" | "success";

function getOrCreateSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function isPromptDismissed() {
  return localStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
}

function isAlreadyRegistered() {
  return localStorage.getItem(FCM_REGISTERED_KEY) === "1";
}

export function GuestFirebaseNotifications() {
  const pathname = usePathname();
  const locale = useLocale();
  const registeringRef = useRef(false);
  const firebaseConfigRef = useRef<{
    config: FirebaseClientConfig;
    vapidKey: string;
  } | null>(null);

  const [promptVisible, setPromptVisible] = useState(false);
  const [promptStatus, setPromptStatus] = useState<PromptStatus>("idle");
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] =
    useState<LiveAnnouncement | null>(null);

  const sendPresence = useCallback(() => {
    const sessionId = getOrCreateSessionId();

    fetch("/api/visits/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path: pathname || "/",
        locale,
      }),
      keepalive: true,
    }).catch(() => {
      // Ignore presence errors on the public site.
    });
  }, [locale, pathname]);

  const registerGuestToken = useCallback(async () => {
    const config = firebaseConfigRef.current;
    if (!config || registeringRef.current) return false;

    registeringRef.current = true;
    setPromptStatus("loading");
    setPromptMessage(null);

    try {
      const token = await requestFcmToken({
        config: config.config,
        vapidKey: config.vapidKey,
      });

      if (!token) {
        setPromptStatus("denied");
        setPromptMessage(
          "Notifications were blocked. Enable them in your browser settings to receive updates.",
        );
        return false;
      }

      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/guest/fcm-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, token, locale }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(
          payload?.message ?? "Could not save notification settings.",
        );
      }

      localStorage.setItem(FCM_REGISTERED_KEY, "1");
      setPromptStatus("success");
      setPromptMessage("Notifications enabled.");
      window.setTimeout(() => setPromptVisible(false), 1200);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setPromptStatus("error");

      if (message.includes("applicationServerKey is not valid")) {
        setPromptMessage(
          "Firebase VAPID key is invalid. In Firebase Console open Project Settings → Cloud Messaging → Web Push certificates, copy the key pair, and set NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local, then restart the server.",
        );
      } else {
        setPromptMessage(
          message || "Could not enable notifications. Please try again.",
        );
      }
      return false;
    } finally {
      registeringRef.current = false;
    }
  }, [locale]);

  useEffect(() => {
    sendPresence();
    const presenceTimer = window.setInterval(sendPresence, 60000);
    return () => window.clearInterval(presenceTimer);
  }, [sendPresence]);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/guest/fcm-tokens", {
          cache: "no-store",
        });
        const payload = (await response.json()) as FcmConfigResponse;

        if (cancelled || !response.ok || !payload.data) return;

        const { enabled, config, vapidKey, vapidKeyError } = payload.data;
        if (!enabled || !config || !vapidKey) {
          if (vapidKeyError) {
            setPromptVisible(true);
            setPromptStatus("error");
            setPromptMessage(vapidKeyError);
          }
          return;
        }

        firebaseConfigRef.current = { config, vapidKey };
        setFirebaseReady(true);

        if (isAlreadyRegistered()) {
          void registerGuestToken();
          return;
        }

        if (!isPromptDismissed()) {
          setPromptVisible(true);
        }
      } catch {
        // Ignore config errors on the public site.
      }
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, [registerGuestToken]);

  useEffect(() => {
    const config = firebaseConfigRef.current?.config;
    if (!firebaseReady || !config) return;

    let unsubscribe = () => {};

    listenForForegroundMessages(config, ({ title, body }) => {
      if (!title && !body) return;

      setLiveAnnouncement({
        title: title ?? "EviMersin",
        message: body ?? "",
      });

      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification(title ?? "EviMersin", { body: body ?? "" });
      }
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => unsubscribe();
  }, [firebaseReady]);

  function dismissPrompt() {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    setPromptVisible(false);
    setPromptStatus("idle");
    setPromptMessage(null);
  }

  function dismissAnnouncement() {
    setLiveAnnouncement(null);
  }

  const isLoading = promptStatus === "loading";
  const canEnable = Boolean(firebaseConfigRef.current);

  return (
    <>
      {promptVisible ? (
        <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#dbeafe] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
                Get live updates from EviMersin
              </p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">
                Allow browser notifications to receive announcements while you
                browse.
              </p>
              {promptMessage ? (
                <p
                  className={`mt-2 text-[12px] font-medium ${
                    promptStatus === "success"
                      ? "text-[#15803d]"
                      : promptStatus === "denied" || promptStatus === "error"
                        ? "text-[#b91c1c]"
                        : "text-[var(--muted)]"
                  }`}
                >
                  {promptMessage}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canEnable ? (
                <button
                  type="button"
                  onClick={() => void registerGuestToken()}
                  disabled={isLoading}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Enabling..." : "Enable"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={dismissPrompt}
                disabled={isLoading}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-[#dbe4f0] px-4 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {canEnable ? "Not now" : "Close"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {liveAnnouncement ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-[9998] px-4 pb-4 sm:px-6"
        >
          <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-[#dbeafe] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[var(--brand-blue)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M4 10V14L8 16V18C8 19.1 8.9 20 10 20H14C15.1 20 16 19.1 16 18V16L20 14V10L12 6L4 10Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
                {liveAnnouncement.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                {liveAnnouncement.message}
              </p>
            </div>

            <button
              type="button"
              onClick={dismissAnnouncement}
              aria-label="Dismiss announcement"
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[var(--brand-navy)]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M7 7L17 17M17 7L7 17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
