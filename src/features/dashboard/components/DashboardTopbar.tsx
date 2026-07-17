"use client";

type DashboardTopbarProps = {
  onMenuOpen: () => void;
};

export function DashboardTopbar({ onMenuOpen }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#eef2f7] bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:rounded-t-[28px] lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open sidebar"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#e5eaf2] text-[var(--brand-navy)] transition-colors hover:bg-[#f5f7fa] lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="min-w-0">
          <p className="truncate text-[12px] text-[var(--muted)]">
            EviMersin Admin · Updated just now
          </p>
          <p className="truncate text-[16px] font-bold text-[var(--brand-navy)] sm:text-[17px]">
            Dashboard Overview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <label htmlFor="dashboard-search" className="sr-only">
            Search listings
          </label>
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search listings, clients..."
            className="h-10 w-64 rounded-full border border-[#e5eaf2] bg-[#f8fafc] pl-10 pr-3 text-[13px] text-[var(--brand-navy)] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[var(--brand-blue)] focus:bg-white"
          />
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M16.5 16.5L20 20"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e5eaf2] text-[var(--brand-navy)] transition-colors hover:bg-[#f5f7fa]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M6 9.5C6 6.5 8.5 4 12 4C15.5 4 18 6.5 18 9.5V14L20 16H4L6 14V9.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M10 18C10.4 19.1 11.1 19.8 12 19.8C12.9 19.8 13.6 19.1 14 18"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--brand-red)]" />
        </button>
      </div>
    </header>
  );
}
