"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { PermissionMatrix } from "@/features/dashboard/components/PermissionMatrix";
import {
  FormLoading,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { usePermissions } from "@/hooks/usePermissions";
import { summarizePermissions } from "@/lib/auth/permissions";
import { SUPER_ADMIN_PERMISSION } from "@/constants/permissions";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useCreateDashboardUserMutation,
  useDeleteDashboardUserMutation,
  useGetDashboardUsersQuery,
  useRequestUserEmailVerificationMutation,
  useUpdateDashboardUserMutation,
  type DashboardUser,
} from "@/store/slices/admin/adminsApi";
import { useAppSelector } from "@/store/hooks";

type UserFormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  emailOtp: string;
  permissions: string[];
  status: 0 | 1;
};

const emptyForm: UserFormState = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  emailOtp: "",
  permissions: ["overview:read", "security:read"],
  status: 1,
};

function UserModal({
  open,
  mode,
  initialUser,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialUser?: DashboardUser;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [step, setStep] = useState<"details" | "verify">("details");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);
  const [localError, setLocalError] = useState<unknown>(null);

  const [requestVerification, verificationState] =
    useRequestUserEmailVerificationMutation();
  const [createUser, createState] = useCreateDashboardUserMutation();
  const [updateUser, updateState] = useUpdateDashboardUserMutation();

  const isSuperAdmin = initialUser?.roleName === "super_admin";
  const originalEmail = initialUser?.email.trim().toLowerCase() ?? "";
  const emailChanged =
    mode === "edit" &&
    form.email.trim().toLowerCase() !== originalEmail &&
    form.email.trim().length > 0;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialUser) {
      setForm({
        firstName: initialUser.firstName,
        lastName: initialUser.lastName,
        username: initialUser.username,
        email: initialUser.email,
        password: "",
        emailOtp: "",
        permissions: initialUser.permissions.includes(SUPER_ADMIN_PERMISSION)
          ? [SUPER_ADMIN_PERMISSION]
          : [...initialUser.permissions],
        status: initialUser.status === 1 ? 1 : 0,
      });
      setEmailVerified(true);
      setStep("details");
    } else {
      setForm(emptyForm);
      setEmailVerified(false);
      setStep("details");
    }

    setEmailMasked(null);
    setLocalError(null);
  }, [open, mode, initialUser]);

  useEffect(() => {
    if (mode === "create") {
      setEmailVerified(false);
      setForm((prev) => ({ ...prev, emailOtp: "" }));
      setStep("details");
    }
  }, [form.email, form.firstName, form.lastName, mode]);

  function setEmailOtp(value: string) {
    setForm((prev) => ({ ...prev, emailOtp: value }));
  }

  async function handleSendVerification() {
    setLocalError(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setLocalError(new Error("Enter first name, last name, and email first."));
      return;
    }

    try {
      const result = await requestVerification({
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      }).unwrap();
      setEmailMasked(result.emailMasked);
      setStep("verify");
    } catch (error) {
      setLocalError(error);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (mode === "create" && !emailVerified) {
      setLocalError(new Error("Verify the email address before creating this user."));
      return;
    }

    if (emailChanged && !form.emailOtp.trim()) {
      setLocalError(new Error("Enter the verification code sent to the new email."));
      return;
    }

    try {
      if (mode === "create") {
        await createUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          permissions: form.permissions,
          emailOtp: form.emailOtp.trim(),
          status: form.status,
        }).unwrap();
        onSaved("User created successfully.");
      } else if (initialUser) {
        await updateUser({
          id: initialUser.id,
          body: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            permissions: isSuperAdmin ? undefined : form.permissions,
            status: form.status,
            ...(form.password ? { password: form.password } : {}),
            ...(emailChanged ? { emailOtp: form.emailOtp.trim() } : {}),
          },
        }).unwrap();
        onSaved("User updated successfully.");
      }
      onClose();
    } catch (error) {
      setLocalError(error);
    }
  }

  if (!open) return null;

  const saving = createState.isLoading || updateState.isLoading;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:rounded-[28px]">
        <div className="flex items-start justify-between border-b border-[#e8eef6] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {mode === "create" ? "New user" : "Edit user"}
            </p>
            <h2 className="mt-1 text-[1.35rem] font-bold tracking-tight text-[var(--brand-navy)]">
              {mode === "create" ? "Create dashboard user" : "Update dashboard user"}
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] text-[var(--muted)]">
              Set account details, verify email with OTP, and choose exactly what
              this user can view, add, edit, or delete.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe4f0] text-[var(--muted)] hover:bg-[#f8fafc]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-5 py-5 sm:px-6">
            {localError ? (
              <div className="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
                {getApiErrorMessage(localError)}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="First name"
                value={form.firstName}
                required
                onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
              />
              <TextInput
                label="Last name"
                value={form.lastName}
                required
                onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
              />
              <TextInput
                label="Username"
                value={form.username}
                required
                onChange={(value) => setForm((prev) => ({ ...prev, username: value }))}
              />
              <TextInput
                label="Email"
                type="email"
                value={form.email}
                required
                onChange={(value) => {
                  const nextEmail = value.trim().toLowerCase();
                  setForm((prev) => ({ ...prev, email: value, emailOtp: "" }));
                  if (mode === "create") {
                    setEmailVerified(false);
                    setStep("details");
                  } else {
                    setEmailVerified(nextEmail === originalEmail);
                    if (nextEmail !== originalEmail) setStep("details");
                  }
                }}
              />
              <TextInput
                label={mode === "create" ? "Password" : "New password (optional)"}
                type="password"
                value={form.password}
                required={mode === "create"}
                onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
              />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[var(--brand-navy)]">
                  Status
                </span>
                <select
                  value={form.status}
                  disabled={isSuperAdmin}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: Number(event.target.value) as 0 | 1,
                    }))
                  }
                  className="w-full rounded-xl border border-[#dbe4f0] bg-white px-3.5 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)] disabled:opacity-60"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </label>
            </div>

            <div className="mt-6 rounded-[20px] border border-[#e8eef6] bg-[#f8fafc] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
                    Email verification
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                    {mode === "create"
                      ? "Required before the account is created."
                      : emailChanged
                        ? "Required when changing to a new email."
                        : "Already verified for the current email."}
                  </p>
                </div>
                {(mode === "create" || emailChanged) && !isSuperAdmin ? (
                  <button
                    type="button"
                    disabled={verificationState.isLoading}
                    onClick={() => void handleSendVerification()}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--brand-blue)] px-4 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-70"
                  >
                    {verificationState.isLoading ? "Sending..." : "Send verification code"}
                  </button>
                ) : (
                  <span className="inline-flex rounded-full bg-[#ecfdf3] px-3 py-1 text-[12px] font-semibold text-[#15803d]">
                    Verified
                  </span>
                )}
              </div>

              {(mode === "create" || emailChanged) && step === "verify" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <TextInput
                    label={`6-digit code${emailMasked ? ` sent to ${emailMasked}` : ""}`}
                    value={form.emailOtp}
                    required
                    onChange={(value) => {
                      setEmailOtp(value.replace(/\D/g, "").slice(0, 6));
                      if (value.trim().length === 6) setEmailVerified(true);
                    }}
                  />
                  <div className="flex items-end">
                    <span className="rounded-full bg-[#eff6ff] px-3 py-2 text-[12px] font-semibold text-[var(--brand-blue)]">
                      {emailVerified ? "Code ready" : "Enter code"}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <PermissionMatrix
                value={form.permissions}
                onChange={(permissions) => setForm((prev) => ({ ...prev, permissions }))}
                readOnly={isSuperAdmin}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e8eef6] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e] disabled:opacity-70"
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create user"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsersPanel() {
  const currentAdminId = useAppSelector((state) => state.auth.admin?.id);
  const { can } = usePermissions();
  const canCreate = can("users:create") || can("users:write");
  const canUpdate = can("users:update") || can("users:write");
  const canDelete = can("users:delete") || can("users:write");

  const { data: users, isLoading, error } = useGetDashboardUsersQuery();
  const [deleteUser, deleteState] = useDeleteDashboardUserMutation();

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const sortedUsers = useMemo(
    () => [...(users ?? [])].sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [users],
  );

  async function handleDelete(userId: number) {
    if (!canDelete || userId === currentAdminId) return;
    if (!window.confirm("Delete this dashboard user?")) return;

    setActionError(null);
    setSavedMessage(null);

    try {
      await deleteUser(userId).unwrap();
      setSavedMessage("User deleted.");
    } catch (err) {
      setActionError(err);
    }
  }

  if (isLoading && !users) return <FormLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
            Dashboard users
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
            Create accounts with first name, last name, and verified email. Choose
            exact permissions with view, add, edit, and delete checkboxes for each
            area.
          </p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setModalMode("create");
            }}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
          >
            Add user
          </button>
        ) : null}
      </div>

      {error || actionError ? (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
          {getApiErrorMessage(actionError ?? error)}
        </div>
      ) : null}

      {savedMessage ? (
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
          {savedMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead className="border-b border-[#e8eef6] bg-[#f8fafc] text-[12px] uppercase tracking-[0.06em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Access</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {(canUpdate || canDelete) && (
                  <th className="px-4 py-3 font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => {
                const isSelf = user.id === currentAdminId;
                const isSuperAdmin = user.roleName === "super_admin";

                return (
                  <tr key={user.id} className="border-b border-[#eef2f7] last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--brand-navy)]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                        @{user.username} · {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[12px] font-semibold text-[var(--brand-blue)]">
                        {isSuperAdmin ? "Super Admin" : summarizePermissions(user.permissions)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                          user.status === 1
                            ? "bg-[#ecfdf3] text-[#15803d]"
                            : "bg-[#fef2f2] text-[#b91c1c]"
                        }`}
                      >
                        {user.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {canUpdate ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalMode("edit");
                              }}
                              className="rounded-full border border-[#dbe4f0] px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
                            >
                              Edit
                            </button>
                          ) : null}
                          {canDelete && !isSelf && !isSuperAdmin ? (
                            <button
                              type="button"
                              disabled={deleteState.isLoading}
                              onClick={() => void handleDelete(user.id)}
                              className="rounded-full border border-[#fecaca] px-3 py-1.5 text-[12px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                            >
                              Delete
                            </button>
                          ) : isSelf || isSuperAdmin ? (
                            <span className="text-[12px] text-[var(--muted)]">Protected</span>
                          ) : null}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <UserModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        initialUser={selectedUser ?? undefined}
        onClose={() => {
          setModalMode(null);
          setSelectedUser(null);
        }}
        onSaved={setSavedMessage}
      />
    </div>
  );
}
