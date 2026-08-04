"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PermissionMatrix } from "@/features/dashboard/components/PermissionMatrix";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";
import {
  loadUserDraft,
  saveUserDraft,
  type UserDraft,
} from "@/features/dashboard/lib/userDraftStorage";
import { permissionCount } from "@/lib/auth/permissions";

type UserPermissionsEditorProps = {
  mode: "create" | "edit";
  userId?: number;
  backHref: string;
  returnHref: string;
};

export function UserPermissionsEditor({
  mode,
  userId,
  backHref,
  returnHref,
}: UserPermissionsEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadUserDraft();
    if (!stored || stored.mode !== mode || (userId && stored.userId !== userId)) {
      router.replace(backHref);
      return;
    }
    setDraft(stored);
    setPermissions(stored.form.permissions);
    setReady(true);
  }, [backHref, mode, router, userId]);

  function handleSave() {
    if (!draft) return;

    saveUserDraft({
      ...draft,
      form: {
        ...draft.form,
        permissions,
      },
    });
    router.push(returnHref);
  }

  if (!ready || !draft) {
    return (
      <div className="rounded-[24px] border border-[#e8eef6] bg-white px-5 py-16 text-center text-[14px] text-[var(--muted)]">
        Loading permissions...
      </div>
    );
  }

  const userLabel =
    draft.form.firstName || draft.form.lastName
      ? `${draft.form.firstName} ${draft.form.lastName}`.trim()
      : draft.form.username || "New user";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={returnHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--brand-navy)]"
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
          Back to user form
        </Link>
        <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
          User permissions
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
          Set what <strong className="text-[var(--brand-navy)]">{userLabel}</strong> can
          view, add, edit, or delete. {permissionCount(permissions)} permission
          {permissionCount(permissions) === 1 ? "" : "s"} selected.
        </p>
      </div>

      <PermissionMatrix value={permissions} onChange={setPermissions} variant="table" />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={returnHref}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={permissions.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e] disabled:opacity-60"
        >
          Save permissions
        </button>
      </div>
    </div>
  );
}

export function UserPermissionsPage(props: UserPermissionsEditorProps) {
  return (
    <RequireDashboardAccess tab="users" permission="users:create">
      <UserPermissionsEditor {...props} />
    </RequireDashboardAccess>
  );
}

export function UserPermissionsEditPage(props: UserPermissionsEditorProps) {
  return (
    <RequireDashboardAccess tab="users" permission="users:update">
      <UserPermissionsEditor {...props} />
    </RequireDashboardAccess>
  );
}
