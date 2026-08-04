"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

const SESSION_KEY = "evimersin_visit_session";
const DISMISSED_KEY = "evimersin_announcement_dismissed";

type ActiveAnnouncement = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
};

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

function getDismissedId() {
  const raw = sessionStorage.getItem(DISMISSED_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function setDismissedId(id: number) {
  sessionStorage.setItem(DISMISSED_KEY, String(id));
}

export function GuestAnnouncementBanner() {
  const pathname = usePathname();
  const locale = useLocale();
  const [announcement, setAnnouncement] = useState<ActiveAnnouncement | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

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

  const fetchAnnouncement = useCallback(async () => {
    try {
      const response = await fetch("/api/announcements/active");
      if (!response.ok) return;

      const payload = (await response.json()) as {
        data?: { announcement: ActiveAnnouncement | null };
      };
      const next = payload.data?.announcement ?? null;

      if (!next || getDismissedId() === next.id) {
        setAnnouncement(null);
        setVisible(false);
        return;
      }

      setAnnouncement(next);
      setVisible(true);
    } catch {
      // Ignore fetch errors on the public site.
    }
  }, []);

  useEffect(() => {
    sendPresence();
    void fetchAnnouncement();

    const presenceTimer = window.setInterval(sendPresence, 60000);
    const pollTimer = window.setInterval(() => {
      void fetchAnnouncement();
    }, 30000);

    return () => {
      window.clearInterval(presenceTimer);
      window.clearInterval(pollTimer);
    };
  }, [fetchAnnouncement, sendPresence]);

  function dismiss() {
    if (announcement) {
      setDismissedId(announcement.id);
    }
    setVisible(false);
  }

  if (!visible || !announcement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6"
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
              d="M12 3V13M12 3L8 7M12 3L16 7M5 10V17C5 18.1 5.9 19 7 19H17C18.1 19 19 18.1 19 17V10"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
            {announcement.title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
            {announcement.message}
          </p>
        </div>

        <button
          type="button"
          onClick={dismiss}
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
  );
}
