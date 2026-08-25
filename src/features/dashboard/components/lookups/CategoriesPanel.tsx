"use client";

import { useMemo, useState } from "react";
import { routes } from "@/constants/routes";
import {
  LookupListLayout,
  LookupTable,
  RowActions,
  StatusBadge,
} from "@/features/dashboard/components/lookups/LookupManager";
import {
  matchesDashboardSearch,
  useDashboardSearchQuery,
} from "@/features/dashboard/hooks/useDashboardSearch";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/store/slices/admin";

export function CategoriesPanel() {
  const { can } = usePermissions();
  const canCreate = can("categories:create");
  const canUpdate = can("categories:update");
  const canDelete = can("categories:delete");
  const { data = [], isLoading, error } = useGetCategoriesQuery();
  const [deleteCategory, deleteState] = useDeleteCategoryMutation();
  const [actionError, setActionError] = useState<unknown>(null);
  const deferredQuery = useDashboardSearchQuery();

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        matchesDashboardSearch(
          deferredQuery,
          item.id,
          item.name,
          item.name_ar,
          item.position,
        ),
      ),
    [data, deferredQuery],
  );

  return (
    <LookupListLayout
      title="Categories"
      description="Manage property categories used across listings and filters."
      addHref={routes.lookupNew("categories")}
      addLabel="Add category"
      showAdd={canCreate}
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No categories yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No categories match “{deferredQuery.trim()}”.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Name (AR)", "Position", "Status", "Actions"]}
          rows={filtered.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">{item.name}</td>
              <td className="px-5 py-3 text-[var(--brand-navy)]" dir="rtl">
                {item.name_ar || "—"}
              </td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">{item.position}</td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("categories", item.id)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  deleting={deleteState.isLoading}
                  confirmTitle="Delete category?"
                  confirmMessage={`Are you sure you want to delete “${item.name}”? This action cannot be undone.`}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deleteCategory(item.id).unwrap();
                    } catch (err) {
                      setActionError(err);
                      throw err;
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        />
      )}
    </LookupListLayout>
  );
}
