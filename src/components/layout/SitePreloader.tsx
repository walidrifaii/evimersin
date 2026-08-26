"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { images } from "@/constants/images";
import { config } from "@/constants/config";

const SESSION_KEY = "evimersin_preloader_done";
const VISIBLE_MS = 1200;
const EXIT_MS = 300;
const EXIT_EVENT = "evimersin-preloader-exit";

declare global {
  interface Window {
    __evimersinPreloaderTimer?: number;
  }
}

function isPreloaderDone() {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return true;
  } catch {
    // ignore
  }
  return document.documentElement.classList.contains("preloader-skip");
}

function markPreloaderDone() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore
  }
  document.documentElement.classList.add("preloader-skip");
}

/**
 * First paint only. Never turns on again after content loads / remounts.
 * (Previous bug: started hidden, then useEffect set visible=true → second splash.)
 */
export function SitePreloader() {
  const [phase, setPhase] = useState<"show" | "exit" | "gone">(() => {
    if (typeof window === "undefined") return "show";
    return isPreloaderDone() ? "gone" : "show";
  });

  useEffect(() => {
    if (isPreloaderDone()) {
      setPhase("gone");
      return;
    }

    function onExit() {
      setPhase("exit");
      window.setTimeout(() => setPhase("gone"), EXIT_MS);
    }

    window.addEventListener(EXIT_EVENT, onExit);

    // One shared timer for the whole tab — remounts must not restart the splash.
    if (!window.__evimersinPreloaderTimer) {
      window.__evimersinPreloaderTimer = window.setTimeout(() => {
        markPreloaderDone();
        window.dispatchEvent(new Event(EXIT_EVENT));
      }, VISIBLE_MS);
    }

    return () => {
      window.removeEventListener(EXIT_EVENT, onExit);
    };
  }, []);

  useEffect(() => {
    if (phase !== "show" && phase !== "exit") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      id="site-preloader"
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--brand-navy)] transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-busy={phase === "show"}
      aria-live="polite"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="preloader-orb preloader-orb-a absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[var(--brand-blue)]/18 blur-3xl" />
        <div className="preloader-orb preloader-orb-b absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[var(--brand-red)]/14 blur-3xl" />
        <div className="preloader-grid absolute inset-0" />
      </div>

      <div
        className={`relative flex flex-col items-center px-6 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === "exit"
            ? "translate-y-4 scale-[0.97] opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <p className="preloader-tagline mb-7 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/40 sm:mb-8 sm:text-[0.72rem]">
          {config.tagline}
        </p>

        <div className="preloader-logo-drawer" aria-hidden="true">
          <Image
            src={images.logoFooter}
            alt={config.appName}
            priority
            className="preloader-logo-inner h-24 w-auto sm:h-28 md:h-32 lg:h-36"
          />
        </div>

        <div className="preloader-underline mt-5 h-px w-0 bg-gradient-to-r from-transparent via-[var(--brand-red)] to-transparent sm:mt-6" />

        <p className="preloader-subtitle mt-6 text-[12px] font-medium tracking-[0.06em] text-white/35 sm:mt-7 sm:text-[13px]">
          Finding your place
        </p>

        <div className="preloader-bar-wrap mt-8 h-[2px] w-28 overflow-hidden rounded-full bg-white/10 sm:mt-9 sm:w-32">
          <div className="preloader-progress relative h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--brand-red)] via-white/90 to-[var(--brand-blue)]">
            <span className="preloader-shimmer absolute inset-y-0 left-0 w-1/3 bg-white/45" />
          </div>
        </div>
      </div>
    </div>
  );
}
