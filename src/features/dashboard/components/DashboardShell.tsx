"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { DashboardTopbar } from "@/features/dashboard/components/DashboardTopbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 10% 20%, rgba(37, 99, 235, 0.55), transparent 55%),
            radial-gradient(ellipse 70% 55% at 90% 15%, rgba(227, 28, 35, 0.35), transparent 50%),
            radial-gradient(ellipse 75% 60% at 70% 85%, rgba(27, 42, 74, 0.55), transparent 55%),
            radial-gradient(ellipse 60% 50% at 20% 90%, rgba(37, 99, 235, 0.3), transparent 50%),
            linear-gradient(135deg, #1b2a4a 0%, #2563eb 42%, #7c9cff 68%, #e31c23 100%)
          `,
        }}
      />

      <div className="relative z-10 flex min-h-screen gap-0 p-0 lg:gap-5 lg:p-5">
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white lg:min-h-[calc(100vh-2.5rem)] lg:rounded-[28px] lg:shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <DashboardTopbar onMenuOpen={() => setSidebarOpen(true)} />
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
