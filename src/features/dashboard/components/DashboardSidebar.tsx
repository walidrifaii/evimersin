"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { config } from "@/constants/config";
import { dashboardNav } from "@/features/dashboard/data";
import { routes } from "@/constants/routes";
import { useLogoutMutation } from "@/store/slices/auth/authApi";
import { clearCredentials } from "@/store/slices/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function NavIcon({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-5 w-5",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "overview":
      return (
        <svg {...common}>
          <path
            d="M4 11.5L12 4L20 11.5V19.5C20 20.05 19.55 20.5 19 20.5H5C4.45 20.5 4 20.05 4 19.5V11.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "listings":
      return (
        <svg {...common}>
          <path
            d="M4 7H20M4 12H20M4 17H14"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "inquiries":
      return (
        <svg {...common}>
          <path
            d="M5 7H19V17H8L5 20V7Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "deals":
      return (
        <svg {...common}>
          <path
            d="M12 3L14.2 8.4L20 9.2L15.8 13.2L17 19L12 16.2L7 19L8.2 13.2L4 9.2L9.8 8.4L12 3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "agents":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M5.5 19C6.4 15.8 8.9 14 12 14C15.1 14 17.6 15.8 18.5 19"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path
            d="M5 19V11M10 19V7M15 19V13M20 19V5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 4V6M12 18V20M4 12H6M18 12H20M6.5 6.5L8 8M16 16L17.5 17.5M6.5 17.5L8 16M16 8L17.5 6.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const dispatch = useAppDispatch();
  const { admin, refreshToken } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logout(refreshToken).unwrap();
    } finally {
      dispatch(clearCredentials());
      router.replace(routes.login);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col text-white transition-transform duration-300 lg:static lg:z-auto lg:w-[250px] lg:shrink-0 lg:translate-x-0 lg:rounded-[28px] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.16)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.18)",
        }}
      >
        <div className="flex h-16 items-center justify-between px-5 pt-2">
          <Link href={routes.dashboardTab("overview")} className="flex min-w-0 items-center gap-2.5" onClick={onClose}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M4 7H10V17H4V7ZM14 7H20V11H14V7ZM14 13H20V17H14V13Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="truncate text-[1.1rem] font-bold tracking-tight">
              <span className="text-white/95">Evi</span>
              <span className="text-white">Mersin</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/85 transition-colors hover:bg-white/15 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
            Menu
          </p>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
          {dashboardNav.map((item) => {
            const tab =
              new URL(item.href, "http://local").searchParams.get("tab") ?? "overview";
            const isActive =
              pathname === routes.dashboard && activeTab === tab;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`group flex cursor-pointer items-center gap-3 rounded-full px-3.5 py-2.5 text-[14px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/25 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                    : "text-white/75 hover:bg-white/12 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-white" : "text-white/65"}>
                  <NavIcon id={item.id} />
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/15 p-4">
          <Link
            href={routes.home}
            className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/12 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M15 6L9 12L15 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to website
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-white/12 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)] text-[12px] font-bold text-white">
              {(admin?.name ?? "AD")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {admin?.name ?? "Admin"}
              </p>
              <p className="truncate text-[11px] text-white/60">
                @{admin?.username ?? "admin"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/25"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
          <p className="px-1 text-[10px] text-white/45">{config.tagline}</p>
        </div>
      </aside>
    </>
  );
}
