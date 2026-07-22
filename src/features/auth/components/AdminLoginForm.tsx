"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import logoImage from "@/assets/images/logo.png";
import { routes } from "@/constants/routes";
import { useLoginMutation } from "@/store/slices/auth/authApi";
import { setCredentials } from "@/store/slices/auth/authSlice";
import { getApiErrorMessage } from "@/store/api/errors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AdminLoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { hydrated, accessToken } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace(routes.dashboard);
    }
  }, [accessToken, hydrated, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const session = await login({ username: username.trim(), password }).unwrap();
      dispatch(setCredentials(session));
      router.replace(routes.dashboard);
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
              Admin Login
            </h1>
            <p className="mt-2 text-[14px] text-[var(--muted)]">
              Sign in to manage properties and inquiries
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-semibold text-[var(--brand-navy)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-4 pr-12 text-[14px] text-[var(--brand-navy)] outline-none transition-colors focus:border-[var(--brand-blue)] focus:bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[12px] font-semibold text-[var(--muted)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href={routes.forgotPassword}
                className="text-[13px] font-semibold text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[13px] font-medium text-[#b91c1c]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-red)] text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
