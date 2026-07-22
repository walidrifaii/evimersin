import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { StoreProvider } from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "EviMersin property operations dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] text-[var(--muted)]">
            Loading dashboard...
          </div>
        }
      >
        <AuthGuard>
          <DashboardShell>{children}</DashboardShell>
        </AuthGuard>
      </Suspense>
    </StoreProvider>
  );
}
