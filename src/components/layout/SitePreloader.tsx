"use client";

import { useEffect, useState } from "react";
import { config } from "@/constants/config";

const MIN_VISIBLE_MS = 2400;
const EXIT_MS = 750;

/** Brand letters: Evi (red) + Mersin (white) — reveal from first → last */
const brandLetters = [
  { char: "E", tone: "red" as const },
  { char: "v", tone: "red" as const },
  { char: "i", tone: "red" as const },
  { char: "M", tone: "light" as const },
  { char: "e", tone: "light" as const },
  { char: "r", tone: "light" as const },
  { char: "s", tone: "light" as const },
  { char: "i", tone: "light" as const },
  { char: "n", tone: "light" as const },
];

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
      fallbackTimer = setTimeout(finish, 4200);
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
        <p className="preloader-tagline mb-7 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/40 sm:mb-8 sm:text-[0.72rem]">
          {config.tagline}
        </p>

        <h1 className="sr-only">{config.appName}</h1>

        <div
          className="flex items-end justify-center"
          aria-hidden="true"
        >
          {brandLetters.map((letter, index) => {
            /* Reveal order: first letter → last letter */
            const delayMs = 120 + index * 95;

            return (
              <span
                key={`${letter.char}-${index}`}
                className="preloader-letter-drawer"
              >
                <span
                  className={`preloader-letter-inner text-[2.6rem] font-bold leading-none tracking-[-0.04em] sm:text-[3.35rem] lg:text-[3.75rem] ${
                    letter.tone === "red" ? "text-[var(--brand-red)]" : "text-white"
                  }`}
                  style={{ animationDelay: `${delayMs}ms` }}
                >
                  {letter.char}
                </span>
              </span>
            );
          })}
        </div>

        <div className="preloader-underline mt-5 h-px w-0 bg-gradient-to-r from-transparent via-[var(--brand-red)] to-transparent sm:mt-6" />

        <p className="preloader-subtitle mt-6 text-[12px] font-medium tracking-[0.06em] text-white/35 sm:mt-7 sm:text-[13px]">
          Finding your place in Mersin
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
