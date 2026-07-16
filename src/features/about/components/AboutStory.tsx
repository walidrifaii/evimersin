import Image from "next/image";
import { aboutData } from "@/features/about/data";

function SectionArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--brand-red)]"
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AboutStory() {
  const { eyebrow, title, paragraphs, image, imageAlt } = aboutData.story;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">
              <SectionArrow />
              {eyebrow}
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem] lg:text-[2.35rem]">
              {title}
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-7 text-[var(--muted)] sm:text-[16px]">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
