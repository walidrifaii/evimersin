import { aboutData } from "@/features/about/data";

export function AboutMission() {
  const { title, description, points } = aboutData.mission;

  return (
    <section className="w-full overflow-hidden rounded-t-3xl rounded-b-3xl bg-[var(--brand-navy)]">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.35rem]">
              {title}
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/75 sm:text-[16px]">
              {description}
            </p>
          </div>

          <ul className="space-y-4">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red)] text-[11px] font-bold text-white">
                  ✓
                </span>
                <span className="text-[15px] leading-relaxed text-white/90">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
