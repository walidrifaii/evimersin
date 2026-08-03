"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

const SESSION_KEY = "evimersin_visit_session";
const REPORTED_KEY = "evimersin_visit_reported";

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

export function VisitTracker() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (sessionStorage.getItem(REPORTED_KEY) === "1") return;

    const sessionId = getOrCreateSessionId();

    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path: pathname || "/",
        locale,
        referrer: document.referrer || "",
      }),
      keepalive: true,
    })
      .then((response) => {
        if (response.ok) {
          sessionStorage.setItem(REPORTED_KEY, "1");
        }
      })
      .catch(() => {
        // Ignore tracking errors on the public site.
      });
  }, [locale, pathname]);

  return null;
}
