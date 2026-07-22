"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { getApiErrorMessage } from "@/store/api/errors";

export function LookupListLayout({
  title,
  description,
  addHref,
  addLabel = "Add new",
  loading,
  error,
  children,
}: {
  title: string;
  description: string;
  addHref: string;
  addLabel?: string;
  loading: boolean;
  error?: unknown;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-blue)]">
            Lookups
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">{description}</p>
        </div>
        <Link
          href={addHref}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
        >
          {addLabel}
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
          {getApiErrorMessage(error)}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        {loading ? (
          <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">Loading...</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function LookupFormLayout({
  title,
  description,
  backHref,
  onSubmit,
  submitting,
  submitLabel,
  error,
  children,
}: {
  title: string;
  description: string;
  backHref: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  submitLabel: string;
  error?: unknown;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand-navy)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
        <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">{description}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-2xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>

        {error ? (
          <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
            {getApiErrorMessage(error)}
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
          <Link
            href={backHref}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#d7dee8] bg-white px-5 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: 0 | 1;
  onChange: (value: 0 | 1) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">Status</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as 0 | 1)}
        className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
      >
        <option value={1}>Active</option>
        <option value={0}>Inactive</option>
      </select>
    </label>
  );
}

export function FeaturedSelect({
  value,
  onChange,
}: {
  value: 0 | 1;
  onChange: (value: 0 | 1) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
        Featured
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as 0 | 1)}
        className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
      >
        <option value={1}>Yes</option>
        <option value={0}>No</option>
      </select>
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
      />
    </label>
  );
}

export function LookupTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead className="bg-[#f8fafc] text-[12px] uppercase tracking-[0.06em] text-[var(--muted)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function ConfirmDeleteDrawer({
  open,
  title,
  message,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  deleting?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, deleting, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close confirmation"
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!deleting) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[#e8eef6] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
      >
        <h2
          id={titleId}
          className="text-[1.15rem] font-bold tracking-tight text-[var(--brand-navy)]"
        >
          {title}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{message}</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#d7dee8] bg-white px-5 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RowActions({
  editHref,
  onDelete,
  deleting,
  confirmTitle = "Delete item?",
  confirmMessage = "Are you sure you want to delete this item? This action cannot be undone.",
}: {
  editHref: string;
  onDelete: () => void | Promise<void>;
  deleting?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  async function handleConfirm() {
    setConfirmError(null);
    try {
      await onDelete();
      setConfirmOpen(false);
    } catch (err) {
      setConfirmError(getApiErrorMessage(err));
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={editHref}
          className="cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-blue)] hover:bg-[#eff6ff]"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => {
            setConfirmError(null);
            setConfirmOpen(true);
          }}
          disabled={deleting}
          className="cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-red)] hover:bg-[#fef2f2] disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <ConfirmDeleteDrawer
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        deleting={deleting}
        error={confirmError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void handleConfirm();
        }}
      />
    </>
  );
}

export function StatusBadge({ status }: { status: 0 | 1 }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        status === 1
          ? "bg-[#ecfdf5] text-[#047857]"
          : "bg-[#f1f5f9] text-[#64748b]"
      }`}
    >
      {status === 1 ? "Active" : "Inactive"}
    </span>
  );
}

export function FormLoading() {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-[14px] text-[var(--muted)]">
      Loading...
    </div>
  );
}
