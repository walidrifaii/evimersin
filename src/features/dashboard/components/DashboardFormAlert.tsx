"use client";

import { humanizeFieldName } from "@/store/api/errors";

export function DashboardFormAlert({
  message,
  fieldErrors,
  showFieldList = false,
}: {
  message?: string | null;
  fieldErrors?: Record<string, string>;
  showFieldList?: boolean;
}) {
  const entries = fieldErrors ? Object.entries(fieldErrors) : [];

  if (!message && entries.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[13px] text-[#b91c1c]"
    >
      {message ? <p className="font-medium">{message}</p> : null}
      {showFieldList && entries.length > 0 ? (
        <ul className={`space-y-1 ${message ? "mt-2" : ""}`}>
          {entries.map(([field, detail]) => (
            <li key={field}>
              <span className="font-semibold">{humanizeFieldName(field)}:</span>{" "}
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function fieldControlClass(hasError?: string) {
  return hasError
    ? "h-11 w-full min-w-0 rounded-xl border border-[#fca5a5] bg-[#fef2f2] px-2.5 text-[13px] text-[var(--brand-navy)] outline-none focus:border-[#b91c1c] focus:bg-white sm:px-3 sm:text-[14px]"
    : "h-11 w-full min-w-0 rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-2.5 text-[13px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white sm:px-3 sm:text-[14px]";
}

export function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[12px] font-medium text-[#b91c1c]">{message}</p>;
}
