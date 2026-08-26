"use client";

import { useEffect, useState, type ComponentType } from "react";

const DEFER_MS = 4500;

/**
 * Visit tracking + FCM must not compete with first paint / home data.
 * Wait until the splash is done (or timeout), then idle before loading.
 */
export function DeferredSiteClients() {
  const [Inner, setInner] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function load() {
      if (cancelled) return;
      void import("@/components/layout/DeferredSiteClientsInner").then((mod) => {
        if (!cancelled) setInner(() => mod.DeferredSiteClientsInner);
      });
    }

    function scheduleLoad() {
      if (cancelled) return;
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => load(), { timeout: 2000 });
      } else {
        timeoutId = setTimeout(load, 500);
      }
    }

    function waitForSplashThenLoad() {
      if (document.documentElement.classList.contains("preloader-skip")) {
        scheduleLoad();
        return;
      }

      timeoutId = setTimeout(scheduleLoad, DEFER_MS);
    }

    // Prefer after full load so we don't fight hero images / RSC streams.
    if (document.readyState === "complete") {
      waitForSplashThenLoad();
    } else {
      window.addEventListener("load", waitForSplashThenLoad, { once: true });
      timeoutId = setTimeout(waitForSplashThenLoad, DEFER_MS + 1000);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", waitForSplashThenLoad);
      if (timeoutId) clearTimeout(timeoutId);
      if (
        idleId !== undefined &&
        typeof window !== "undefined" &&
        "cancelIdleCallback" in window
      ) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  if (!Inner) return null;
  return <Inner />;
}
