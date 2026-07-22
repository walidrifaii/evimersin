import type { AnalyticsChartPoint } from "@/store/slices/admin";

type PurposeMixChartProps = {
  data: AnalyticsChartPoint[];
};

export function PurposeMixChart({ data }: PurposeMixChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const max = Math.max(...data.map((item) => item.value), 1);

  if (data.length === 0) {
    return (
      <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
          Buy / Rent Mix
        </h2>
        <p className="mt-8 text-center text-[13px] text-[var(--muted)]">
          No active listings to chart yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
          Buy / Rent Mix
        </h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Active listings by purpose filter
        </p>
      </div>

      <ul className="space-y-4">
        {data.map((item) => {
          const width = Math.max((item.value / max) * 100, 8);
          const pct = Math.round((item.value / total) * 100);
          return (
            <li key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
                <span className="font-semibold text-[var(--brand-navy)]">{item.label}</span>
                <span className="text-[var(--muted)]">
                  {item.value} · {pct}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#eef2f7]">
                <div
                  className="h-full rounded-full bg-[var(--brand-blue)] transition-all duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
