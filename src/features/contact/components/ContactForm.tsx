"use client";

import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";
import { useTranslations } from "next-intl";
import { useWhatsAppUrl } from "@/components/providers/SiteSettingsProvider";
import {
  initialContactForm,
  type ContactFormState,
} from "@/features/contact/data";

const subjectOptions = [
  { value: "General Inquiry", key: "general" },
  { value: "Schedule a Viewing", key: "viewing" },
  { value: "Buy a Property", key: "buy" },
  { value: "Sell a Property", key: "sell" },
  { value: "Investment Advice", key: "investment" },
  { value: "Other", key: "other" },
] as const;

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[14px] font-semibold text-[var(--brand-navy)]"
    >
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-[#e8edf5] bg-white px-4 py-3 text-[15px] text-[var(--brand-navy)] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[#eff6ff]";

function resizeMessageField(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function ContactForm() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const whatsappUrl = useWhatsAppUrl();
  const [form, setForm] = useState<ContactFormState>(initialContactForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    resizeMessageField(messageRef.current);
  }, [form.message]);

  function updateField<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(t("fillRequired"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject,
          message: form.message.trim(),
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || t("sendFailed"));
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sendFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#e8edf5] bg-white p-8 text-center shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] text-[var(--brand-blue)]">
          <HiCheckCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-[1.35rem] font-bold text-[var(--brand-navy)]">
          {t("successTitle")}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
          {t("successDescription")}
        </p>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c9181e]"
          >
            <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
            {tCommon("chatOnWhatsapp")}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e8edf5] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:p-8"
    >
      <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.65rem]">
        {t("formTitle")}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
        {t("formDescription")}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-name">{t("fullName")}</FieldLabel>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            className={inputClassName}
            autoComplete="name"
            required
          />
        </div>

        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-email">{t("email")}</FieldLabel>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            className={inputClassName}
            autoComplete="email"
            required
          />
        </div>

        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-phone">{t("phone")}</FieldLabel>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+961 71 959 921"
            className={inputClassName}
            autoComplete="tel"
          />
        </div>

        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-subject">{t("subject")}</FieldLabel>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            className={`${inputClassName} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27none%27%3E%3Cpath d=%27M4 6L8 10L12 6%27 stroke=%27%236b7280%27 stroke-width=%271.6%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
          >
            {subjectOptions.map((subject) => (
              <option key={subject.key} value={subject.value}>
                {t(`subjects.${subject.key}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="contact-message">{t("message")}</FieldLabel>
          <textarea
            ref={messageRef}
            id="contact-message"
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder={t("messagePlaceholder")}
            rows={1}
            className={`${inputClassName} min-h-[56px] resize-none overflow-hidden`}
            required
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-[14px] font-medium text-[var(--brand-red)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[var(--brand-blue)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {submitting ? t("sending") : t("sendMessage")}
      </button>
    </form>
  );
}
