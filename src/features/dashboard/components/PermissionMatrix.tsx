"use client";

import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_MODULES,
  PERMISSION_PRESETS,
  SUPER_ADMIN_PERMISSION,
} from "@/constants/permissions";
import {
  permissionCount,
  toggleModulePermissions,
  togglePermission,
} from "@/lib/auth/permissions";

type PermissionMatrixProps = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: "default" | "table";
};

function isModuleFullySelected(
  permissions: string[],
  moduleId: string,
  actions: readonly string[],
) {
  return actions.every((action) => permissions.includes(`${moduleId}:${action}`));
}

function isModulePartiallySelected(
  permissions: string[],
  moduleId: string,
  actions: readonly string[],
) {
  const selected = actions.filter((action) => permissions.includes(`${moduleId}:${action}`));
  return selected.length > 0 && selected.length < actions.length;
}

function mergePermissions(current: string[], incoming: string[]) {
  return [...new Set([...current, ...incoming])];
}

function removeModulePermissions(current: string[], moduleId: string) {
  return current.filter((permission) => !permission.startsWith(`${moduleId}:`));
}

export function PermissionMatrix({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  variant = "default",
}: PermissionMatrixProps) {
  const isLocked = disabled || readOnly;
  const selectedCount = permissionCount(value);

  function applyPreset(key: keyof typeof PERMISSION_PRESETS, mode: "replace" | "add") {
    if (isLocked) return;
    const preset = PERMISSION_PRESETS[key].permissions;
    onChange(mode === "replace" ? [...preset] : mergePermissions(value, preset));
  }

  function clearAll() {
    if (isLocked) return;
    onChange(["security:read"]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[var(--brand-navy)]">
              Access permissions
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">
              {selectedCount} permission{selectedCount === 1 ? "" : "s"} selected
            </p>
          </div>
          {!isLocked ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#fecaca] px-3 text-[12px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
            >
              Remove all
            </button>
          ) : null}
        </div>

        {!isLocked ? (
          <div className="overflow-hidden rounded-[16px] border border-[#e8eef6]">
            <div className="border-b border-[#e8eef6] bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Role shortcuts
            </div>
            <div className="divide-y divide-[#eef2f7]">
              {(Object.keys(PERMISSION_PRESETS) as Array<keyof typeof PERMISSION_PRESETS>).map(
                (key) => (
                  <div
                    key={key}
                    className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--brand-navy)]">
                        {PERMISSION_PRESETS[key].label}
                      </p>
                      <p className="text-[12px] text-[var(--muted)]">
                        {PERMISSION_PRESETS[key].description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreset(key, "replace")}
                        className="rounded-full border border-[#dbe4f0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] hover:bg-[#eff6ff]"
                      >
                        Apply role
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset(key, "add")}
                        className="rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1.5 text-[12px] font-semibold text-[#15803d] hover:bg-[#dcfce7]"
                      >
                        + Add role
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const presetSet = new Set(PERMISSION_PRESETS[key].permissions);
                          onChange(value.filter((permission) => !presetSet.has(permission)));
                        }}
                        className="rounded-full border border-[#fecaca] bg-[#fef2f2] px-3 py-1.5 text-[12px] font-semibold text-[#b91c1c] hover:bg-[#fee2e2]"
                      >
                        − Remove role
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>

      {value.includes(SUPER_ADMIN_PERMISSION) ? (
        <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[13px] font-medium text-[var(--brand-blue)]">
          This account has full super admin access.
        </div>
      ) : variant === "table" ? (
        <div className="overflow-x-auto rounded-[20px] border border-[#e8eef6]">
          <table className="min-w-full text-left text-[13px]">
            <thead className="border-b border-[#e8eef6] bg-[#f8fafc] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Area</th>
                <th className="px-3 py-3 text-center font-semibold">View</th>
                <th className="px-3 py-3 text-center font-semibold">Add</th>
                <th className="px-3 py-3 text-center font-semibold">Edit</th>
                <th className="px-3 py-3 text-center font-semibold">Delete</th>
                {!isLocked ? (
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f7]">
              {PERMISSION_MODULES.map((module) => {
                const fullySelected = isModuleFullySelected(
                  value,
                  module.id,
                  module.actions,
                );

                return (
                  <tr key={module.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--brand-navy)]">{module.label}</p>
                      <p className="mt-0.5 max-w-xs text-[12px] text-[var(--muted)]">
                        {module.description}
                      </p>
                    </td>
                    {(["read", "create", "update", "delete"] as const).map((action) => {
                      const permission = `${module.id}:${action}`;
                      const available = module.actions.includes(action);
                      const checked = value.includes(permission);

                      return (
                        <td key={permission} className="px-3 py-4 text-center">
                          {available ? (
                            <label className="inline-flex cursor-pointer flex-col items-center gap-1">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isLocked}
                                onChange={(event) =>
                                  onChange(
                                    togglePermission(value, permission, event.target.checked),
                                  )
                                }
                                className="h-4 w-4 rounded border-[#cbd5e1] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)]"
                              />
                            </label>
                          ) : (
                            <span className="text-[#cbd5e1]">—</span>
                          )}
                        </td>
                      );
                    })}
                    {!isLocked ? (
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onChange(
                                toggleModulePermissions(
                                  value,
                                  module.id,
                                  module.actions,
                                  true,
                                ),
                              )
                            }
                            className="text-[12px] font-semibold text-[var(--brand-blue)] hover:underline"
                          >
                            + Add all
                          </button>
                          <button
                            type="button"
                            onClick={() => onChange(removeModulePermissions(value, module.id))}
                            className="text-[12px] font-semibold text-[#b91c1c] hover:underline"
                          >
                            − Remove
                          </button>
                          {fullySelected ? (
                            <span className="rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">
                              Full
                            </span>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-[#e8eef6]">
          <div className="hidden grid-cols-[minmax(180px,1.4fr)_repeat(4,minmax(72px,0.7fr))] gap-2 border-b border-[#e8eef6] bg-[#f8fafc] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] md:grid">
            <span>Area</span>
            <span className="text-center">View</span>
            <span className="text-center">Add</span>
            <span className="text-center">Edit</span>
            <span className="text-center">Delete</span>
          </div>

          <div className="divide-y divide-[#eef2f7]">
            {PERMISSION_MODULES.map((module) => {
              const fullySelected = isModuleFullySelected(
                value,
                module.id,
                module.actions,
              );
              const partiallySelected = isModulePartiallySelected(
                value,
                module.id,
                module.actions,
              );

              return (
                <div
                  key={module.id}
                  className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[minmax(180px,1.4fr)_repeat(4,minmax(72px,0.7fr))] md:items-center md:gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      {!isLocked ? (
                        <input
                          type="checkbox"
                          checked={fullySelected}
                          ref={(element) => {
                            if (element) {
                              element.indeterminate =
                                partiallySelected && !fullySelected;
                            }
                          }}
                          onChange={(event) =>
                            onChange(
                              toggleModulePermissions(
                                value,
                                module.id,
                                module.actions,
                                event.target.checked,
                              ),
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-[#cbd5e1] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)]"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
                          {module.label}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                          {module.description}
                        </p>
                        {!isLocked ? (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onChange(
                                  toggleModulePermissions(
                                    value,
                                    module.id,
                                    module.actions,
                                    true,
                                  ),
                                )
                              }
                              className="text-[11px] font-semibold text-[var(--brand-blue)]"
                            >
                              + Add all
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onChange(removeModulePermissions(value, module.id))
                              }
                              className="text-[11px] font-semibold text-[#b91c1c]"
                            >
                              − Remove
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {(["read", "create", "update", "delete"] as const).map((action) => {
                    const permission = `${module.id}:${action}`;
                    const available = module.actions.includes(action);

                    if (!available) {
                      return (
                        <div
                          key={permission}
                          className="hidden items-center justify-center md:flex"
                        >
                          <span className="text-[12px] text-[#cbd5e1]">—</span>
                        </div>
                      );
                    }

                    const checked = value.includes(permission);

                    return (
                      <label
                        key={permission}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 md:flex-col md:justify-center md:gap-1 md:border-transparent md:px-0 md:py-0 ${
                          checked
                            ? "border-[#bfdbfe] bg-[#eff6ff]"
                            : "border-[#eef2f7] bg-[#fcfdff]"
                        }`}
                      >
                        <span className="text-[12px] font-medium text-[var(--brand-navy)] md:hidden">
                          {PERMISSION_ACTION_LABELS[action]}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isLocked}
                          onChange={(event) =>
                            onChange(
                              togglePermission(value, permission, event.target.checked),
                            )
                          }
                          className="h-4 w-4 rounded border-[#cbd5e1] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] disabled:opacity-60"
                        />
                        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)] md:block">
                          {PERMISSION_ACTION_LABELS[action]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
