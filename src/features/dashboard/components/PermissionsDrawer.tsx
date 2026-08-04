"use client";

import { SideDrawer } from "@/features/dashboard/components/SideDrawer";
import { PermissionMatrix } from "@/features/dashboard/components/PermissionMatrix";

type PermissionsDrawerProps = {
  open: boolean;
  onClose: () => void;
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
};

export function PermissionsDrawer({
  open,
  onClose,
  value,
  onChange,
  readOnly = false,
}: PermissionsDrawerProps) {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Roles & permissions"
      description="Add or remove access for each dashboard area. Use role shortcuts or pick View, Add, Edit, and Delete per row."
      widthClassName="max-w-3xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] hover:bg-[#f8fafc]"
          >
            Close
          </button>
          {!readOnly ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white hover:bg-[#c9181e]"
            >
              Save access
            </button>
          ) : null}
        </div>
      }
    >
      <PermissionMatrix
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        variant="table"
      />
    </SideDrawer>
  );
}
