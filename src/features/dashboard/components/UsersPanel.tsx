"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailVerificationModal } from "@/features/dashboard/components/EmailVerificationModal";
import {
  FormLoading,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { DashboardFormAlert } from "@/features/dashboard/components/DashboardFormAlert";
import { useDashboardFormErrors } from "@/features/dashboard/hooks/useDashboardFormErrors";
import {
  loadUserDraft,
  saveUserDraft,
  type UserDraftForm,
} from "@/features/dashboard/lib/userDraftStorage";
import { usePermissions } from "@/hooks/usePermissions";
import { permissionCount, summarizePermissions } from "@/lib/auth/permissions";
import { routes } from "@/constants/routes";
import { SUPER_ADMIN_PERMISSION } from "@/constants/permissions";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useCreateDashboardUserMutation,
  useDeleteDashboardUserMutation,
  useGetDashboardUsersQuery,
  useUpdateDashboardUserMutation,
  type DashboardUser,
} from "@/store/slices/admin/adminsApi";
import { useAppSelector } from "@/store/hooks";

type UserFormState = UserDraftForm;

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
  draftForm,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialUser?: DashboardUser;
  draftForm?: UserFormState | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const formErrors = useDashboardFormErrors();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

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

    if (draftForm) {
      setForm(draftForm);
    } else if (mode === "edit" && initialUser) {
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
    } else {
      setForm(emptyForm);
    }

    setVerifyModalOpen(false);
    formErrors.clear();
  }, [open, mode, initialUser, draftForm]);

  const permissionTotal = useMemo(
    () => permissionCount(form.permissions),
    [form.permissions],
  );

  function validateForm(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.username.trim()) errors.username = "Username is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (mode === "create" && !form.password) {
      errors.password = "Password is required";
    }
    if (form.permissions.length === 0) {
      errors.permissions = "Add at least one permission for this user";
    }
    return errors;
  }

  function updateFormField<K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    formErrors.clearField(String(key));
  }

  function handleOpenPermissions() {
    formErrors.clear();

    saveUserDraft({
      mode,
      userId: initialUser?.id,
      form,
    });

    if (mode === "create") {
      router.push(routes.dashboardUserPermissionsNew);
      return;
    }

    if (initialUser) {
      router.push(routes.dashboardUserPermissions(initialUser.id));
    }
  }

  async function handleCreate() {
    try {
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
      onClose();
    } catch (error) {
      formErrors.apply(error);
    }
  }

  async function handleUpdate() {
    if (!initialUser) return;

    try {
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
      onClose();
    } catch (error) {
      formErrors.apply(error);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formErrors.clear();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      formErrors.setLocal("Please fix the highlighted fields below.", validationErrors);
      return;
    }

    if (mode === "create") {
      setVerifyModalOpen(true);
      return;
    }

    if (emailChanged) {
      setVerifyModalOpen(true);
      return;
    }

    void handleUpdate();
  }

  function handleVerifyConfirm() {
    if (mode === "create") {
      void handleCreate();
      return;
    }
    void handleUpdate();
  }

  if (!open) return null;

  const saving = createState.isLoading || updateState.isLoading;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:rounded-[28px]">
        <div className="flex items-start justify-between border-b border-[#e8eef6] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {mode === "create" ? "New user" : "Edit user"}
            </p>
            <h2 className="mt-1 text-[1.35rem] font-bold tracking-tight text-[var(--brand-navy)]">
              {mode === "create" ? "Create dashboard user" : "Update dashboard user"}
            </h2>
            <p className="mt-1 max-w-xl text-[13px] text-[var(--muted)]">
              {mode === "create"
                ? "Fill in account details, set permissions, then verify email when you create the user."
                : "Update account details and permissions for this user."}
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
            {formErrors.banner ? (
              <div className="mb-4">
                <DashboardFormAlert
                  message={formErrors.banner}
                  fieldErrors={formErrors.fields}
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="First name"
                value={form.firstName}
                required
                error={formErrors.field("firstName")}
                onChange={(value) => updateFormField("firstName", value)}
              />
              <TextInput
                label="Last name"
                value={form.lastName}
                required
                error={formErrors.field("lastName")}
                onChange={(value) => updateFormField("lastName", value)}
              />
              <TextInput
                label="Username"
                value={form.username}
                required
                error={formErrors.field("username")}
                onChange={(value) => updateFormField("username", value)}
              />
              <TextInput
                label="Email"
                type="email"
                value={form.email}
                required
                error={formErrors.field("email")}
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, email: value, emailOtp: "" }));
                  formErrors.clearField("email");
                  formErrors.clearField("emailOtp");
                }}
              />
              <TextInput
                label={mode === "create" ? "Password" : "New password (optional)"}
                type="password"
                error={formErrors.field("password")}
                value={form.password}
                required={mode === "create"}
                onChange={(value) => updateFormField("password", value)}
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

            {!isSuperAdmin ? (
              <p className="mt-5 text-[12px] text-[var(--muted)]">
                {permissionTotal} permission{permissionTotal === 1 ? "" : "s"} selected.
                Use the Permissions button to manage access.
                {formErrors.field("permissions") ? (
                  <span className="mt-1 block font-medium text-[#b91c1c]">
                    {formErrors.field("permissions")}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="mt-5 text-[12px] font-medium text-[var(--brand-blue)]">
                Super admin — full access
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e8eef6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {!isSuperAdmin ? (
                <button
                  type="button"
                  onClick={handleOpenPermissions}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] bg-white px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] hover:bg-[#eff6ff]"
                >
                  Permissions
                </button>
              ) : null}
              <button
                type="submit"
                disabled={saving || form.permissions.length === 0}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e] disabled:opacity-70"
              >
                {saving
                  ? "Saving..."
                  : mode === "create"
                    ? "Create user"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <EmailVerificationModal
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        email={form.email}
        firstName={form.firstName}
        lastName={form.lastName}
        otp={form.emailOtp}
        onOtpChange={(otp) => setForm((prev) => ({ ...prev, emailOtp: otp }))}
        onConfirm={handleVerifyConfirm}
        confirming={saving}
        title={mode === "create" ? "Verify email" : "Verify new email"}
        confirmLabel={
          mode === "create" ? "Verify & create user" : "Verify & save changes"
        }
      />
    </div>
  );
}

export function UsersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAdminId = useAppSelector((state) => state.auth.admin?.id);
  const { can } = usePermissions();
  const canCreate = can("users:create") || can("users:write");
  const canUpdate = can("users:update") || can("users:write");
  const canDelete = can("users:delete") || can("users:write");

  const { data: users, isLoading, error } = useGetDashboardUsersQuery();
  const [deleteUser, deleteState] = useDeleteDashboardUserMutation();

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [draftForm, setDraftForm] = useState<UserFormState | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const sortedUsers = useMemo(
    () => [...(users ?? [])].sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [users],
  );

  useEffect(() => {
    if (searchParams.get("resumeUserDraft") !== "1") return;

    const draft = loadUserDraft();
    router.replace(routes.dashboardTab("users"));

    if (!draft) return;

    if (draft.mode === "edit" && draft.userId) {
      const user = users?.find((entry) => entry.id === draft.userId) ?? null;
      setSelectedUser(user);
      setModalMode("edit");
    } else {
      setSelectedUser(null);
      setModalMode("create");
    }

    setDraftForm(draft.form);
  }, [router, searchParams, users]);

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
            Create accounts with first name, last name, and verified email. Set
            permissions on a separate page with view, add, edit, and delete
            controls for each area.
          </p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => {
              setDraftForm(null);
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
                                setDraftForm(null);
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
        draftForm={draftForm}
        onClose={() => {
          setModalMode(null);
          setSelectedUser(null);
          setDraftForm(null);
        }}
        onSaved={setSavedMessage}
      />
    </div>
  );
}
