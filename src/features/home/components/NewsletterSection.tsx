"use client";

import { useState, type FormEvent } from "react";
import { HiCheckCircle, HiOutlineMail } from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";

const inputClassName =
  "h-12 w-full rounded-xl border border-[#e8edf5] bg-white px-4 text-[15px] text-[var(--brand-navy)] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[#eff6ff]";

export function NewsletterSection() {
  const t = useTranslations("home.newsletter");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("fillRequired"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          locale,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        if (response.status === 409) {
          setError(t("alreadySubscribed"));
          return;
        }
        throw new Error(result.message || t("sendFailed"));
      }

      setSubmitted(true);
      setName("");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sendFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="relative overflow-hidden rounded-3xl border border-[#e8edf5] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] shadow-[0_16px_48px_rgba(15,23,42,0.18)]"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--brand-blue)]/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[var(--brand-red)]/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-14 lg:py-14">
            <div className="text-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/90 backdrop-blur-sm">
                <HiOutlineMail className="h-3.5 w-3.5" aria-hidden="true" />
                {t("badge")}
              </div>

              <h2 className="mt-5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2.1rem] lg:text-[2.35rem]">
                {t("title")}
                <span className="block text-[var(--brand-blue)]">{t("titleAccent")}</span>
              </h2>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[16px]">
                {t("description")}
              </p>

              <ul className="mt-6 space-y-2.5 text-[14px] text-white/80 sm:text-[15px]">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-red)]" />
                  {t("benefit1")}
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-red)]" />
                  {t("benefit2")}
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-red)]" />
                  {t("benefit3")}
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.2)] backdrop-blur-sm sm:p-7">
              {submitted ? (
                <div className="py-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] text-[var(--brand-blue)]">
                    <HiCheckCircle className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-[1.25rem] font-bold text-[var(--brand-navy)]">
                    {t("successTitle")}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">
                    {t("successDescription")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="newsletter-name"
                      className="mb-2 block text-[13px] font-semibold text-[var(--brand-navy)]"
                    >
                      {t("name")}
                    </label>
                    <input
                      id="newsletter-name"
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setError("");
                      }}
                      placeholder={t("namePlaceholder")}
                      className={inputClassName}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newsletter-email"
                      className="mb-2 block text-[13px] font-semibold text-[var(--brand-navy)]"
                    >
                      {t("email")}
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder={t("emailPlaceholder")}
                      className={inputClassName}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {error ? (
                    <p className="text-[13px] font-medium text-[var(--brand-red)]">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--brand-blue)] px-6 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] transition-all duration-300 hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? t("subscribing") : t("subscribe")}
                  </button>

                  <p className="text-center text-[12px] leading-relaxed text-[var(--muted)]">
                    {t("privacyNote")}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
