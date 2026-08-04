"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/store/slices/auth/authApi";
import { updateAdmin } from "@/store/slices/auth/authSlice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { hydrated, accessToken } = useAppSelector((state) => state.auth);
  const { data: me } = useGetMeQuery(undefined, {
    skip: !hydrated || !accessToken,
  });

  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace(routes.login);
    }
  }, [accessToken, hydrated, router]);

  useEffect(() => {
    if (me) {
      dispatch(updateAdmin(me));
    }
  }, [dispatch, me]);

  if (!hydrated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] text-[var(--muted)]">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
