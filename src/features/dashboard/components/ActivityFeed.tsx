import type { AnalyticsActivity } from "@/store/slices/admin";

type ActivityFeedProps = {
  items: AnalyticsActivity[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-[16px] font-bold text-[var(--brand-navy)]">Activity</h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Recent residential unit listings
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-[var(--muted)]">No recent activity yet.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-[#e5eaf2] pl-4">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)] ring-4 ring-white" />
              <p className="text-[13px] font-semibold text-[var(--brand-navy)]">
                {item.title}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">{item.detail}</p>
              <p className="mt-1 text-[11px] font-medium text-[#94a3b8]">
                {item.time}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
