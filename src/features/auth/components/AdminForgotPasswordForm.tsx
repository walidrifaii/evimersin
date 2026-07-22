"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import logoImage from "@/assets/images/logo.png";
import { routes } from "@/constants/routes";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "@/store/slices/auth/authApi";

type Step = "request" | "verify" | "password" | "done";

const STEPS = [
  { key: "request", label: "Account" },
  { key: "verify", label: "OTP" },
  { key: "password", label: "Password" },
] as const;

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const currentIndex =
    currentStep === "done"
      ? STEPS.length
      : STEPS.findIndex((step) => step.key === currentStep);

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${
                  isActive
                    ? "bg-[var(--brand-blue)] text-white"
                    : isComplete
                      ? "bg-[#dcfce7] text-[#15803d]"
                      : "bg-[#e2e8f0] text-[#64748b]"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? "text-[var(--brand-blue)]" : "text-[#94a3b8]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <div
                className={`mb-4 h-0.5 w-8 ${
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

export function AdminForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [forgotPassword, forgotState] = useForgotPasswordMutation();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();

  async function onRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const result = await forgotPassword({
        identifier: identifier.trim(),
      }).unwrap();
      setMessage(result.message);
      setStep("verify");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function onVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const result = await verifyOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
      }).unwrap();
      setMessage(result.message);
      setStep("password");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function onResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = await resetPassword({
        identifier: identifier.trim(),
        otp: otp.trim(),
        password,
      }).unwrap();
      setMessage(result.message);
      setStep("done");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  const stepDescription =
    step === "request"
      ? "Enter your admin email or username to receive an OTP"
      : step === "verify"
        ? "Enter the 6-digit OTP sent to your admin email"
        : step === "password"
          ? "Choose a new password for your account"
          : "Your password has been updated";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 10% 20%, rgba(37, 99, 235, 0.55), transparent 55%),
            radial-gradient(ellipse 70% 55% at 90% 15%, rgba(227, 28, 35, 0.35), transparent 50%),
            radial-gradient(ellipse 75% 60% at 70% 85%, rgba(27, 42, 74, 0.55), transparent 55%),
            linear-gradient(135deg, #1b2a4a 0%, #2563eb 45%, #e31c23 100%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-[28px] border border-white/25 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-8">
          <div className="mb-5 text-center">
            <Image
              src={logoImage}
              alt="EviMersin"
              className="mx-auto h-14 w-auto sm:h-16"
              priority
            />
            <h1 className="mt-5 text-[1.6rem] font-bold tracking-tight text-[var(--brand-navy)]">
              Reset Password
            </h1>
            <p className="mt-2 text-[14px] text-[var(--muted)]">{stepDescription}</p>
          </div>

          {step !== "done" ? <StepIndicator currentStep={step} /> : null}

          {step === "request" ? (
            <form onSubmit={onRequestOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--brand-navy)]"
                >
                  Email or Username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-[14px] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="admin or admin@evimersin.com"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[13px] font-medium text-[#b91c1c]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={forgotState.isLoading}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-red)] text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {forgotState.isLoading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          ) : null}

          {step === "verify" ? (
            <form onSubmit={onVerifyOtp} className="space-y-4">
              {message ? (
                <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2.5 text-[13px] font-medium text-[#15803d]">
                  {message}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--brand-navy)]"
                >
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-center text-[18px] tracking-[0.4em] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="123456"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[13px] font-medium text-[#b91c1c]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={verifyState.isLoading}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-red)] text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {verifyState.isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  setMessage(null);

                  try {
                    const result = await forgotPassword({
                      identifier: identifier.trim(),
                    }).unwrap();
                    setMessage(result.message);
                  } catch (err) {
                    setError(getApiErrorMessage(err));
                  }
                }}
                disabled={forgotState.isLoading}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[#dbe3ef] bg-white text-[14px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {forgotState.isLoading ? "Sending..." : "Resend OTP"}
              </button>
            </form>
          ) : null}

          {step === "password" ? (
            <form onSubmit={onResetPassword} className="space-y-4">
              {message ? (
                <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2.5 text-[13px] font-medium text-[#15803d]">
                  {message}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--brand-navy)]"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-[14px] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--brand-navy)]"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-[14px] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[13px] font-medium text-[#b91c1c]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={resetState.isLoading}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-red)] text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resetState.isLoading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          ) : null}

          {step === "done" ? (
            <div className="space-y-4 text-center">
              {message ? (
                <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2.5 text-[13px] font-medium text-[#15803d]">
                  {message}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => router.replace(routes.login)}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-blue)] text-[15px] font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                Back to login
              </button>
            </div>
          ) : null}

          {step !== "done" ? (
            <div className="mt-5 text-center">
              <Link
                href={routes.login}
                className="text-[13px] font-semibold text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
              >
                Back to login
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
