"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  FormLoading,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useCreateDashboardUserMutation,
  useDeleteDashboardUserMutation,
  useGetAdminRolesQuery,
  useGetDashboardUsersQuery,
  useUpdateDashboardUserMutation,
} from "@/store/slices/admin/adminsApi";
import { useAppSelector } from "@/store/hooks";

const emptyCreateForm = {
  username: "",
  password: "",
  name: "",
  email: "",
  roleId: 4,
  status: 1 as 0 | 1,
};

export function UsersPanel() {
  const currentAdminId = useAppSelector((state) => state.auth.admin?.id);
  const { can } = usePermissions();
  const canWrite = can("users:write");

  const { data: users, isLoading, error } = useGetDashboardUsersQuery();
  const { data: roles } = useGetAdminRolesQuery();
  const [createUser, createState] = useCreateDashboardUserMutation();
  const [updateUser, updateState] = useUpdateDashboardUserMutation();
  const [deleteUser, deleteState] = useDeleteDashboardUserMutation();

  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const roleOptions = useMemo(
    () => roles?.filter((role) => role.name !== "super_admin") ?? [],
    [roles],
  );

  async function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite) return;

    setActionError(null);
    setSavedMessage(null);

    try {
      await createUser(createForm).unwrap();
      setCreateForm(emptyCreateForm);
      setCreateOpen(false);
      setSavedMessage("User created successfully.");
    } catch (err) {
      setActionError(err);
    }
  }

  async function handleRoleChange(userId: number, roleId: number) {
    if (!canWrite) return;
    setActionError(null);
    setSavedMessage(null);

    try {
      await updateUser({ id: userId, body: { roleId } }).unwrap();
      setSavedMessage("User role updated.");
    } catch (err) {
      setActionError(err);
    }
  }

  async function handleStatusToggle(userId: number, status: 0 | 1) {
    if (!canWrite) return;
    setActionError(null);
    setSavedMessage(null);

    try {
      await updateUser({ id: userId, body: { status } }).unwrap();
      setSavedMessage(status === 1 ? "User activated." : "User deactivated.");
    } catch (err) {
      setActionError(err);
    }
  }

  async function handleDelete(userId: number) {
    if (!canWrite || userId === currentAdminId) return;
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
            Create dashboard accounts and assign roles to control what each user
            can see and do.
          </p>
        </div>
        {canWrite ? (
          <button
            type="button"
            onClick={() => setCreateOpen((open) => !open)}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
          >
            {createOpen ? "Close form" : "Add user"}
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

      {createOpen && canWrite ? (
        <form
          onSubmit={onCreateSubmit}
          className="max-w-3xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6"
        >
          <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
            New dashboard user
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Full name"
              value={createForm.name}
              required
              onChange={(value) => setCreateForm((prev) => ({ ...prev, name: value }))}
            />
            <TextInput
              label="Username"
              value={createForm.username}
              required
              onChange={(value) =>
                setCreateForm((prev) => ({ ...prev, username: value }))
              }
            />
            <TextInput
              label="Email"
              value={createForm.email}
              required
              onChange={(value) => setCreateForm((prev) => ({ ...prev, email: value }))}
            />
            <TextInput
              label="Password"
              type="password"
              value={createForm.password}
              required
              onChange={(value) =>
                setCreateForm((prev) => ({ ...prev, password: value }))
              }
            />
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--brand-navy)]">
                Role
              </span>
              <select
                value={createForm.roleId}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    roleId: Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-[#dbe4f0] bg-white px-3.5 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none focus:border-[var(--brand-blue)]"
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5">
            <button
              type="submit"
              disabled={createState.isLoading}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createState.isLoading ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-[#e8eef6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead className="border-b border-[#e8eef6] bg-[#f8fafc] text-[12px] uppercase tracking-[0.06em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {canWrite ? (
                  <th className="px-4 py-3 font-semibold">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => {
                const isSelf = user.id === currentAdminId;
                const isSuperAdmin = user.roleName === "super_admin";

                return (
                  <tr key={user.id} className="border-b border-[#eef2f7] last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--brand-navy)]">{user.name}</p>
                      <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                        @{user.username} · {user.email}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {canWrite && !isSelf && !isSuperAdmin ? (
                        <select
                          value={user.roleId}
                          disabled={updateState.isLoading}
                          onChange={(event) =>
                            void handleRoleChange(user.id, Number(event.target.value))
                          }
                          className="rounded-lg border border-[#dbe4f0] bg-white px-2.5 py-1.5 text-[13px]"
                        >
                          {roles?.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[12px] font-semibold text-[var(--brand-blue)]">
                          {user.roleLabel}
                        </span>
                      )}
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
                    {canWrite ? (
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {!isSelf && !isSuperAdmin ? (
                            <>
                              <button
                                type="button"
                                disabled={updateState.isLoading}
                                onClick={() =>
                                  void handleStatusToggle(
                                    user.id,
                                    user.status === 1 ? 0 : 1,
                                  )
                                }
                                className="rounded-full border border-[#dbe4f0] px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
                              >
                                {user.status === 1 ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                disabled={deleteState.isLoading}
                                onClick={() => void handleDelete(user.id)}
                                className="rounded-full border border-[#fecaca] px-3 py-1.5 text-[12px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-[12px] text-[var(--muted)]">Protected</span>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">Role guide</h2>
        <ul className="mt-3 space-y-2 text-[13px] text-[var(--muted)]">
          <li><strong className="text-[var(--brand-navy)]">Super Admin</strong> — full access including user management.</li>
          <li><strong className="text-[var(--brand-navy)]">Manager</strong> — all dashboard features except user management.</li>
          <li><strong className="text-[var(--brand-navy)]">Editor</strong> — manage listings, lookups, and announcements.</li>
          <li><strong className="text-[var(--brand-navy)]">Viewer</strong> — read-only access to overview and listings.</li>
        </ul>
      </section>
    </div>
  );
}
