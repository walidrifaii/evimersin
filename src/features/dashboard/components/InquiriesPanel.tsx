import type { DashboardInquiry } from "@/features/dashboard/data";

type InquiriesPanelProps = {
  items: DashboardInquiry[];
};

const statusStyles: Record<DashboardInquiry["status"], string> = {
  New: "bg-[#fef2f2] text-[var(--brand-red)]",
  "In Progress": "bg-[#fff7ed] text-[#c2410c]",
  Closed: "bg-[#f1f5f9] text-[#64748b]",
};

export function InquiriesPanel({ items }: InquiriesPanelProps) {
  return (
    <section className="rounded-2xl border border-[#eef2f7] bg-[#f8fafc] p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">Latest Inquiries</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Respond quickly to boost conversion</p>
        </div>
        <button
          type="button"
          className="cursor-pointer text-[13px] font-semibold text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
        >
          View all
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#eef2f7] bg-white p-3.5 transition-colors hover:bg-[#fafbfd]"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[var(--brand-navy)]">
                {item.name}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{item.property}</p>
              <p className="mt-2 text-[11px] font-medium text-[var(--brand-blue)]">
                {item.channel} · {item.time}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[item.status]}`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
