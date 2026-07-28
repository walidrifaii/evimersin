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

type Mode = "password" | "email";
type Step = "details" | "verify";

function ModeTabs({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
}) {
  const tabs: Array<{ id: Mode; label: string }> = [
    { id: "password", label: "Change password" },
    { id: "email", label: "Change email" },
  ];

  return (
    <div className="flex gap-2 rounded-2xl bg-[#f1f5f9] p-1">
      {tabs.map((tab) => {
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className={`flex-1 cursor-pointer rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? "bg-white text-[var(--brand-navy)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
                : "text-[var(--muted)] hover:text-[var(--brand-navy)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

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
  const [mode, setMode] = useState<Mode>("password");
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

  function resetFormFields(keepEmail = true) {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setChallengeToken("");
    setEmailMasked("");
    setError(null);
    setMessage(null);
    setStep("details");
    if (keepEmail) setEmail(admin?.email ?? "");
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    resetFormFields(true);
  }

  async function submitRequest() {
    setError(null);
    setMessage(null);

    if (!currentPassword.trim()) {
      setError("Current password is required.");
      return;
    }

    if (mode === "password") {
      if (!newPassword.trim()) {
        setError("Enter a new password.");
        return;
      }
      if (newPassword.trim().length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword.trim() !== confirmPassword.trim()) {
        setError("New passwords do not match.");
        return;
      }
    } else {
      const nextEmail = email.trim().toLowerCase();
      const currentEmail = (admin?.email ?? "").trim().toLowerCase();
      if (!nextEmail) {
        setError("Enter a new email.");
        return;
      }
      if (nextEmail === currentEmail) {
        setError("Enter a different email address.");
        return;
      }
    }

    try {
      const result = await requestChangePassword({
        currentPassword,
        email:
          mode === "email"
            ? email.trim()
            : (admin?.email ?? email).trim(),
        ...(mode === "password" ? { newPassword: newPassword.trim() } : {}),
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

  async function onRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitRequest();
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

  return (
    <div className="max-w-3xl overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#eef2f7] bg-[#f8fafc] px-5 py-4 sm:px-6">
        <ModeTabs
          mode={mode}
          disabled={step === "verify"}
          onChange={switchMode}
        />
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-[var(--brand-navy)]">
            {mode === "password" ? "Update password" : "Update email"} · Step{" "}
            {step === "details" ? "1" : "2"} of 2
          </p>
          <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-blue)]">
            OTP protected
          </span>
        </div>

        <StepIndicator step={step} />

        {step === "details" ? (
          <form onSubmit={onRequest} className="space-y-4">
            {mode === "password" ? (
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
                <div className="hidden sm:block" />
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
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInput
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  required
                  placeholder="Confirm it’s you"
                  autoComplete="current-password"
                  onChange={setCurrentPassword}
                />
                <TextInput
                  label="New email"
                  type="email"
                  value={email}
                  required
                  placeholder="new@email.com"
                  onChange={setEmail}
                />
              </div>
            )}

            <p className="text-[12px] text-[var(--muted)]">
              {mode === "password"
                ? `OTP will be sent to your current email (${admin?.email ?? "admin email"}).`
                : "OTP will be sent to the new email so we can verify you own it."}
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
                . Enter it to confirm your{" "}
                {mode === "password" ? "password" : "email"} change.
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
                  void submitRequest();
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
