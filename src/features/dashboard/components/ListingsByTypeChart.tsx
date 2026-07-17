import type { AnalyticsChartPoint } from "@/store/slices/admin";

type ListingsByTypeChartProps = {
  data: AnalyticsChartPoint[];
};

export function ListingsByTypeChart({ data }: ListingsByTypeChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const colors = [
    "var(--brand-navy)",
    "var(--brand-blue)",
    "var(--brand-red)",
    "#0f766e",
    "#c9a84c",
  ];

  if (data.length === 0) {
    return (
      <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
          Inventory Mix
        </h2>
        <p className="mt-8 text-center text-[13px] text-[var(--muted)]">
          No active residential units to chart yet.
        </p>
      </section>
    );
  }

  let offset = 0;
  const segments = data.map((item, index) => {
    const pct = (item.value / total) * 100;
    const start = offset;
    offset += pct;
    return { ...item, pct, start, color: colors[index % colors.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">
          Inventory Mix
        </h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Active residential units by category
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(${gradient})`,
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[1.35rem] font-bold text-[var(--brand-navy)]">
              {total}
            </span>
            <span className="text-[11px] text-[var(--muted)]">Total</span>
          </div>
        </div>

        <ul className="w-full space-y-3">
          {segments.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 text-[13px]"
            >
              <span className="inline-flex items-center gap-2 text-[var(--brand-navy)]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-semibold text-[var(--muted)]">
                {item.value} · {Math.round(item.pct)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
