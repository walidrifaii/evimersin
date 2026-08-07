"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import logoSvg from "@/assets/icons/evimersin-logo.svg";
import { config } from "@/constants/config";

const MIN_VISIBLE_MS = 300;
const EXIT_MS = 400;

export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      delayTimer = setTimeout(() => {
        setExiting(true);
        hideTimer = setTimeout(() => setVisible(false), EXIT_MS);
      }, wait);
    }

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      fallbackTimer = setTimeout(finish, 1500);
    }

    return () => {
      window.removeEventListener("load", finish);
      if (delayTimer) clearTimeout(delayTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--brand-navy)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="preloader-orb preloader-orb-a absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[var(--brand-blue)]/18 blur-3xl" />
        <div className="preloader-orb preloader-orb-b absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[var(--brand-red)]/14 blur-3xl" />
        <div className="preloader-grid absolute inset-0" />
      </div>

      <div
        className={`relative flex flex-col items-center px-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          exiting ? "translate-y-4 scale-[0.97] opacity-0" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <Image
          src={logoSvg}
          alt={config.appName}
          priority
          className="preloader-logo h-auto w-[min(78vw,16rem)] sm:w-[min(72vw,20rem)] lg:w-[22rem]"
        />

        <div className="preloader-bar-wrap mt-8 h-[2px] w-28 overflow-hidden rounded-full bg-white/10 sm:mt-9 sm:w-32">
          <div className="preloader-progress relative h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--brand-red)] via-white/90 to-[var(--brand-blue)]">
            <span className="preloader-shimmer absolute inset-y-0 left-0 w-1/3 bg-white/45" />
          </div>
        </div>
      </div>
    </div>
  );
}
