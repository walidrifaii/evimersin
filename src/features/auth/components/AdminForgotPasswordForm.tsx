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
} from "@/store/slices/auth/authApi";

type Step = "request" | "reset" | "done";

export function AdminForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [username, setUsername] = useState("admin");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [forgotPassword, forgotState] = useForgotPasswordMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();

  async function onRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const result = await forgotPassword({ username: username.trim() }).unwrap();
      setMessage(result.message);
      setStep("reset");
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
        username: username.trim(),
        otp: otp.trim(),
        password,
      }).unwrap();
      setMessage(result.message);
      setStep("done");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

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
          <div className="mb-7 text-center">
            <Image
              src={logoImage}
              alt="EviMersin"
              className="mx-auto h-14 w-auto sm:h-16"
              priority
            />
            <h1 className="mt-5 text-[1.6rem] font-bold tracking-tight text-[var(--brand-navy)]">
              Reset Password
            </h1>
            <p className="mt-2 text-[14px] text-[var(--muted)]">
              {step === "request"
                ? "Enter your admin username to receive an OTP by email"
                : step === "reset"
                  ? "Enter the OTP sent to the admin email and choose a new password"
                  : "Your password has been updated"}
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={onRequestOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--brand-navy)]"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-[14px] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="admin"
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
                {forgotState.isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : null}

          {step === "reset" ? (
            <form onSubmit={onResetPassword} className="space-y-4">
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
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 text-[14px] tracking-[0.3em] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="123456"
                  required
                />
              </div>

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
