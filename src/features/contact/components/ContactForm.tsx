"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";
import { useWhatsAppUrl } from "@/components/providers/SiteSettingsProvider";
import {
  contactData,
  initialContactForm,
  type ContactFormState,
} from "@/features/contact/data";

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

export function ContactForm() {
  const whatsappUrl = useWhatsAppUrl();
  const [form, setForm] = useState<ContactFormState>(initialContactForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
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
        throw new Error(result.message || "Failed to send your message.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send your message.");
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
          Message sent successfully
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
          Thank you for contacting us. Our team will reply to your email as soon as possible.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c9181e]"
        >
          <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e8edf5] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:p-8"
    >
      <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.65rem]">
        {contactData.form.title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
        {contactData.form.description}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-name">Full Name</FieldLabel>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your full name"
            className={inputClassName}
            autoComplete="name"
            required
          />
        </div>

        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
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
          <FieldLabel htmlFor="contact-phone">Phone</FieldLabel>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+90 555 000 00 00"
            className={inputClassName}
            autoComplete="tel"
          />
        </div>

        <div className="sm:col-span-1">
          <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            className={`${inputClassName} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27 fill=%27none%27%3E%3Cpath d=%27M4 6L8 10L12 6%27 stroke=%27%236b7280%27 stroke-width=%271.6%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
          >
            {contactData.form.subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder="Tell us how we can help you..."
            rows={5}
            className={`${inputClassName} resize-y min-h-[140px]`}
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
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--brand-blue)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
