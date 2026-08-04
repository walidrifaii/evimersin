"use client";

import { useState } from "react";
import { SideDrawer } from "@/features/dashboard/components/SideDrawer";
import { TextInput } from "@/features/dashboard/components/lookups/LookupManager";
import { getApiErrorMessage } from "@/store/api/errors";
import { useRequestUserEmailVerificationMutation } from "@/store/slices/admin/adminsApi";

type EmailVerificationDrawerProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  otp: string;
  onOtpChange: (otp: string) => void;
  onVerified: () => void;
  onResetVerification: () => void;
};

export function EmailVerificationDrawer({
  open,
  onClose,
  email,
  firstName,
  lastName,
  verified,
  otp,
  onOtpChange,
  onVerified,
  onResetVerification,
}: EmailVerificationDrawerProps) {
  const [localError, setLocalError] = useState<unknown>(null);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [requestVerification, requestState] = useRequestUserEmailVerificationMutation();

  async function handleSendCode() {
    setLocalError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setLocalError(new Error("Enter first name, last name, and email in the main form first."));
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
      onResetVerification();
    } catch (error) {
      setLocalError(error);
    }
  }

  function handleConfirm() {
    if (otp.trim().length !== 6) {
      setLocalError(new Error("Enter the full 6-digit verification code."));
      return;
    }
    setLocalError(null);
    onVerified();
    onClose();
  }

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Email verification"
      description="Send a one-time code to the user's email. They must confirm it before the account is created."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
          >
            Close
          </button>
          {codeSent && !verified ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={otp.trim().length !== 6}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              Confirm verification
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-5">
        {localError ? (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
            {getApiErrorMessage(localError)}
          </div>
        ) : null}

        <div className="rounded-[20px] border border-[#e8eef6] bg-[#f8fafc] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Email address
          </p>
          <p className="mt-1 text-[15px] font-semibold text-[var(--brand-navy)]">
            {email.trim() || "—"}
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            {firstName.trim()} {lastName.trim()}
          </p>
        </div>

        {verified ? (
          <div className="rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-4 text-[13px] font-medium text-[#15803d]">
            Email verified. You can close this drawer and create the user.
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={requestState.isLoading || !email.trim()}
              onClick={() => void handleSendCode()}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {requestState.isLoading
                ? "Sending code..."
                : codeSent
                  ? "Resend verification code"
                  : "Send verification code"}
            </button>

            {codeSent ? (
              <div className="space-y-3">
                <p className="text-[13px] text-[var(--muted)]">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-[var(--brand-navy)]">
                    {emailMasked ?? email}
                  </strong>
                  .
                </p>
                <TextInput
                  label="Verification code"
                  value={otp}
                  required
                  onChange={(value) => onOtpChange(value.replace(/\D/g, "").slice(0, 6))}
                />
                <div className="flex justify-center gap-1.5 pt-1">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <span
                      key={index}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-[16px] font-bold ${
                        otp[index]
                          ? "border-[var(--brand-blue)] bg-[#eff6ff] text-[var(--brand-blue)]"
                          : "border-[#dbe4f0] bg-white text-[#cbd5e1]"
                      }`}
                    >
                      {otp[index] ?? "·"}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </SideDrawer>
  );
}
