"use client";

import { useEffect, useId, useState } from "react";
import { TextInput } from "@/features/dashboard/components/lookups/LookupManager";
import { getApiErrorMessage } from "@/store/api/errors";
import { useRequestUserEmailVerificationMutation } from "@/store/slices/admin/adminsApi";

type EmailVerificationModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  firstName: string;
  lastName: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  onConfirm: () => void;
  confirming?: boolean;
  title?: string;
  confirmLabel?: string;
};

export function EmailVerificationModal({
  open,
  onClose,
  email,
  firstName,
  lastName,
  otp,
  onOtpChange,
  onConfirm,
  confirming = false,
  title = "Verify email",
  confirmLabel = "Verify & create user",
}: EmailVerificationModalProps) {
  const titleId = useId();
  const [localError, setLocalError] = useState<unknown>(null);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [requestVerification, requestState] = useRequestUserEmailVerificationMutation();

  async function sendCode() {
    setLocalError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setLocalError(new Error("Complete first name, last name, and email first."));
      return;
    }

    try {
      const result = await requestVerification({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }).unwrap();
      setEmailMasked(result.emailMasked);
      setCodeSent(true);
      onOtpChange("");
    } catch (error) {
      setLocalError(error);
    }
  }

  useEffect(() => {
    if (!open) {
      setLocalError(null);
      setCodeSent(false);
      setEmailMasked(null);
      return;
    }

    void sendCode();
  }, [open]);

  function handleConfirm() {
    if (otp.trim().length !== 6) {
      setLocalError(new Error("Enter the full 6-digit verification code."));
      return;
    }
    setLocalError(null);
    onConfirm();
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !confirming) onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, confirming, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close verification"
        className="absolute inset-0 bg-black/45"
        onClick={() => {
          if (!confirming) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-[#e8eef6] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="text-[1.25rem] font-bold tracking-tight text-[var(--brand-navy)]"
            >
              {title}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              Enter the 6-digit code sent to this email.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe4f0] text-[var(--muted)] hover:bg-[#f8fafc] disabled:opacity-60"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {localError ? (
            <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
              {getApiErrorMessage(localError)}
            </div>
          ) : null}

          <div className="rounded-[18px] border border-[#e8eef6] bg-[#f8fafc] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Sending to
            </p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--brand-navy)]">
              {emailMasked ?? email}
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">
              {firstName.trim()} {lastName.trim()}
            </p>
          </div>

          {requestState.isLoading && !codeSent ? (
            <p className="text-center text-[13px] text-[var(--muted)]">Sending code...</p>
          ) : (
            <>
              <TextInput
                label="Verification code"
                value={otp}
                required
                onChange={(value) => onOtpChange(value.replace(/\D/g, "").slice(0, 6))}
              />
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span
                    key={index}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-[17px] font-bold ${
                      otp[index]
                        ? "border-[var(--brand-blue)] bg-[#eff6ff] text-[var(--brand-blue)]"
                        : "border-[#dbe4f0] bg-white text-[#cbd5e1]"
                    }`}
                  >
                    {otp[index] ?? "·"}
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={requestState.isLoading}
                onClick={() => void sendCode()}
                className="text-[12px] font-semibold text-[var(--brand-blue)] hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming || otp.trim().length !== 6 || requestState.isLoading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e] disabled:opacity-60"
          >
            {confirming ? "Saving..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
