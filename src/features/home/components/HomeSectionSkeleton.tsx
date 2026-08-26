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
  variant?: "cards" | "plain" | "newsletter";
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
