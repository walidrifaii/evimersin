import Image from "next/image";
import heroImage from "@/assets/images/hero.webp";
import { contactData } from "@/features/contact/data";

export function ContactHero() {
  const { title, subtitle } = contactData.hero;

  return (
    <section className="relative w-full overflow-hidden bg-[var(--brand-navy)]">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-navy)] via-[var(--brand-navy)]/95 to-[var(--brand-navy)]/80" />
      </div>

      <div className="relative mx-auto w-full px-4 py-20 sm:px-6 sm:py-24 md:px-4 lg:px-[100px] lg:py-28">
        <div className="max-w-3xl animate-[heroFade_700ms_ease-out]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Contact
          </p>
          <h1 className="mt-4 text-[2.25rem] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-[2.75rem] lg:text-[3.25rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-white/80 sm:text-[1.05rem]">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
