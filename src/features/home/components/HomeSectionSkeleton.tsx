function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[#e8edf4] ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

/** Placeholder while below-fold home sections stream / hydrate. */
export function HomeSectionSkeleton({
  variant = "cards",
}: {
  variant?: "cards" | "plain" | "newsletter" | "search" | "categories" | "properties";
}) {
  if (variant === "newsletter") {
    return (
      <section className="w-full bg-[var(--brand-navy)]">
        <div className="mx-auto w-full px-4 py-16 sm:px-6 lg:px-[100px] lg:py-20">
          <div className="mx-auto max-w-xl space-y-4">
            <SkeletonBlock className="mx-auto h-8 w-48 bg-white/15" />
            <SkeletonBlock className="mx-auto h-12 w-full max-w-md bg-white/10" />
            <SkeletonBlock className="mx-auto h-12 w-40 bg-white/15" />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "plain") {
    return (
      <section className="w-full bg-[#f5f7fa]">
        <div className="mx-auto w-full px-4 py-16 sm:px-6 lg:px-[100px] lg:py-20">
          <SkeletonBlock className="mx-auto mb-10 h-10 w-72" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-40" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "search") {
    return (
      <div
        className="w-full overflow-hidden rounded-2xl bg-white/95 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.18)] ring-1 ring-black/5 sm:p-4"
        aria-hidden="true"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-12 rounded-xl" />
          ))}
          <SkeletonBlock className="h-12 rounded-xl bg-[var(--brand-red)]/25" />
        </div>
      </div>
    );
  }

  if (variant === "categories") {
    return (
      <div className="relative z-10 mx-auto -mt-[4.5rem] w-full px-3 sm:-mt-20 sm:px-6 md:-mt-18 md:px-4 lg:-mt-28 lg:px-[100px]">
        <div className="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.025] md:hidden">
          <div className="grid grid-cols-3 divide-x divide-[#e8edf4] rtl:divide-x-reverse sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[5.75rem] flex-col items-center justify-center gap-2 px-1 sm:min-h-[5.9rem]"
              >
                <SkeletonBlock className="h-11 w-11 rounded-full sm:h-14 sm:w-14" />
                <SkeletonBlock className="h-2.5 w-10 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden rounded-2xl bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)] md:block lg:hidden">
          <div className="grid grid-cols-6 divide-x divide-[#eef2f7] rtl:divide-x-reverse">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-[5.9rem] flex-col items-center justify-center gap-2 px-2 py-3"
              >
                <SkeletonBlock className="h-14 w-14 rounded-full" />
                <SkeletonBlock className="h-3 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto hidden max-w-[1720px] grid-cols-6 justify-center gap-4 lg:grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-[17rem] flex-col items-center justify-center gap-5 rounded-2xl bg-white px-5 py-12 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
            >
              <SkeletonBlock className="h-24 w-24 rounded-full" />
              <SkeletonBlock className="h-5 w-28 rounded-md" />
              <SkeletonBlock className="h-4 w-36 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "properties") {
    return (
      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-[100px] lg:py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row">
          <SkeletonBlock className="h-64 w-full rounded-2xl lg:max-w-xs" />
          <div className="min-w-0 flex-1 space-y-4">
            <SkeletonBlock className="h-10 w-48 rounded-xl" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-80 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-20 sm:px-6 lg:px-[100px] lg:py-24">
        <SkeletonBlock className="mb-10 h-10 w-72" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-72" />
          ))}
        </div>
      </div>
    </section>
  );
}
