import type { AnalyticsKpi } from "@/store/slices/admin";

type KpiCardsProps = {
  items: AnalyticsKpi[];
};

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <article
          key={item.id}
          className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] animate-[fadeUp_500ms_ease-out] [animation-fill-mode:both]"
          style={{ animationDelay: `${80 + index * 70}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-medium text-[var(--muted)]">{item.label}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                item.trend === "up"
                  ? "bg-[#ecfdf5] text-[#059669]"
                  : item.trend === "down"
                    ? "bg-[#fef2f2] text-[#dc2626]"
                    : "bg-[#eff6ff] text-[var(--brand-blue)]"
              }`}
            >
              {item.change}
            </span>
          </div>
          <p className="mt-3 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
            {item.value}
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">{item.hint}</p>
        </article>
      ))}
    </div>
  );
}
