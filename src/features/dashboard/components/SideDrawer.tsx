"use client";

import { useEffect, useId, type ReactNode } from "react";

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export function SideDrawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = "max-w-lg",
}: SideDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 flex h-full w-full flex-col bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] ${widthClassName}`}
      >
        <div className="flex items-start justify-between border-b border-[#e8eef6] px-5 py-5">
          <div className="min-w-0 pr-4">
            <h2
              id={titleId}
              className="text-[1.15rem] font-bold tracking-tight text-[var(--brand-navy)]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13px] text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dbe4f0] text-[20px] leading-none text-[var(--muted)] hover:bg-[#f8fafc]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <div className="border-t border-[#e8eef6] px-5 py-4">{footer}</div>
        ) : null}
      </aside>
    </div>
  );
}
