import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { HiArrowRight, HiOutlineHome } from "react-icons/hi";
import { getWhatsAppUrl } from "@/constants/config";
import { routes } from "@/constants/routes";

export function HowItWorksCta() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-[#e8edf5] bg-gradient-to-br from-[#f8fafc] via-white to-[#eff6ff] shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--brand-blue)]/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[var(--brand-red)]/[0.08] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:px-14 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/80 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-blue)]">
                <HiOutlineHome className="h-3.5 w-3.5" aria-hidden="true" />
                Start today
              </div>

              <h2 className="mt-5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2.1rem] lg:text-[2.35rem]">
                Ready to find your
                <span className="block text-[var(--brand-blue)]">dream property?</span>
              </h2>

              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
                Browse verified listings or message our team for personalized help across Mersin
                and the Mediterranean coast.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={routes.properties}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand-blue)] px-6 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)]"
              >
                Browse Properties
                <HiArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e8edf5] bg-white px-6 text-[15px] font-semibold text-[var(--brand-navy)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] hover:shadow-md"
              >
                <FaWhatsapp className="h-4 w-4 text-[var(--brand-red)]" aria-hidden="true" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
