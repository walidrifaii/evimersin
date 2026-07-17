"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/constants/routes";
import { useAppSelector } from "@/store/hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrated, accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace(routes.login);
    }
  }, [accessToken, hydrated, router]);

  if (!hydrated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] text-[var(--muted)]">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
