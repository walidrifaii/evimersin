import type { AnalyticsChartPoint } from "@/store/slices/admin";

type ViewsChartProps = {
  data: AnalyticsChartPoint[];
};

export function ViewsChart({ data }: ViewsChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
            New Residential Units
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Residential units created over the last 7 days
          </p>
        </div>
        <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[12px] font-semibold text-[var(--brand-blue)]">
          Live
        </span>
      </div>

      <div className="flex h-48 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const height = Math.max((point.value / max) * 100, 8);
          return (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-40 w-full items-end justify-center">
                <div
                  className="w-full max-w-[36px] rounded-t-lg bg-[var(--brand-blue)]/90 transition-all duration-300 hover:bg-[var(--brand-blue)]"
                  style={{ height: `${height}%` }}
                  title={`${point.label}: ${point.value}`}
                />
              </div>
              <span className="text-[11px] font-medium text-[var(--muted)]">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
