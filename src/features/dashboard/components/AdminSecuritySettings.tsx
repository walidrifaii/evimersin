"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { TextInput } from "@/features/dashboard/components/lookups/LookupManager";
import { getApiErrorMessage } from "@/store/api/errors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateAdmin } from "@/store/slices/auth/authSlice";
import {
  useConfirmChangePasswordMutation,
  useRequestChangePasswordMutation,
} from "@/store/slices/auth/authApi";

type Step = "details" | "verify";

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { key: "details", label: "Details" },
    { key: "verify", label: "Verify OTP" },
  ] as const;

  return (
    <div className="mb-5 flex items-center gap-3">
      {steps.map((item, index) => {
        const isActive = item.key === step;
        const isComplete = step === "verify" && item.key === "details";

        return (
          <div key={item.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${
                  isActive
                    ? "bg-[var(--brand-blue)] text-white"
                    : isComplete
                      ? "bg-[#dcfce7] text-[#15803d]"
                      : "bg-[#e2e8f0] text-[#64748b]"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-[13px] font-semibold ${
                  isActive ? "text-[var(--brand-navy)]" : "text-[var(--muted)]"
                }`}
              >
                {item.label}
              </span>
            </div>
            {index === 0 ? (
              <div
                className={`h-0.5 w-10 rounded-full ${
                  isComplete ? "bg-[#86efac]" : "bg-[#e2e8f0]"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function AdminSecuritySettings() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.admin);
  const [step, setStep] = useState<Step>("details");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [emailMasked, setEmailMasked] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [requestChangePassword, requestState] = useRequestChangePasswordMutation();
  const [confirmChangePassword, confirmState] = useConfirmChangePasswordMutation();

  useEffect(() => {
    if (admin?.email && step === "details" && !challengeToken) {
      setEmail(admin.email);
    }
  }, [admin?.email, challengeToken, step]);

  async function onRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const result = await requestChangePassword({
        currentPassword,
        newPassword,
        email: email.trim(),
      }).unwrap();
      setChallengeToken(result.challengeToken);
      setEmailMasked(result.emailMasked);
      setMessage(result.message);
      setOtp("");
      setStep("verify");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function onConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const result = await confirmChangePassword({
        otp: otp.trim(),
        challengeToken,
      }).unwrap();
      dispatch(updateAdmin(result.admin));
      setMessage(result.message);
      setStep("details");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setChallengeToken("");
      setEmailMasked("");
      setEmail(result.admin.email);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function onResend() {
    setError(null);
    setMessage(null);

    try {
      const result = await requestChangePassword({
        currentPassword,
        newPassword,
        email: email.trim(),
      }).unwrap();
      setChallengeToken(result.challengeToken);
      setEmailMasked(result.emailMasked);
      setMessage(result.message);
      setOtp("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="max-w-3xl overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#eef2f7] bg-[#f8fafc] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.08em] text-[var(--brand-red)] uppercase">
              Admin account
            </p>
            <h2 className="mt-1 text-[1.05rem] font-bold text-[var(--brand-navy)]">
              Change password & email
            </h2>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              2-step OTP verification. Code is sent to the email you enter below.
            </p>
          </div>
          <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-blue)]">
            OTP protected
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <StepIndicator step={step} />

        {step === "details" ? (
          <form onSubmit={onRequest} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Current password"
                type="password"
                value={currentPassword}
                required
                placeholder="Enter current password"
                autoComplete="current-password"
                onChange={setCurrentPassword}
              />
              <TextInput
                label="Admin email"
                type="email"
                value={email}
                required
                placeholder="admin@evimersin.com"
                onChange={setEmail}
              />
              <TextInput
                label="New password"
                type="password"
                value={newPassword}
                required
                placeholder="At least 6 characters"
                autoComplete="new-password"
                onChange={setNewPassword}
              />
              <TextInput
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                required
                placeholder="Repeat new password"
                autoComplete="new-password"
                onChange={setConfirmPassword}
              />
            </div>

            <p className="text-[12px] text-[var(--muted)]">
              An OTP will be sent to the email above. Use a new email if you want
              to update it, then verify ownership in step 2.
            </p>

            {error ? (
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
                {error}
              </div>
            ) : null}

            {message && !challengeToken ? (
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={requestState.isLoading}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {requestState.isLoading ? "Sending OTP..." : "Continue to OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={onConfirm} className="space-y-4">
            <div className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3">
              <p className="text-[13px] font-semibold text-[var(--brand-navy)]">
                Check your inbox
              </p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-[var(--brand-blue)]">
                  {emailMasked || email}
                </span>
                . Enter it below to finish updating your password and email.
              </p>
            </div>

            <label className="block max-w-xs">
              <span className="mb-1.5 block text-[12px] font-semibold text-[var(--brand-navy)]">
                OTP code
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-center text-[18px] tracking-[0.35em] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] focus:bg-white"
                placeholder="123456"
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
                {message}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={confirmState.isLoading || otp.length !== 6}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {confirmState.isLoading ? "Verifying..." : "Verify & save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void onResend();
                }}
                disabled={requestState.isLoading}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#d7dee8] bg-white px-5 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc] disabled:opacity-70"
              >
                {requestState.isLoading ? "Resending..." : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setOtp("");
                  setError(null);
                  setMessage(null);
                }}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full px-4 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand-navy)]"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
