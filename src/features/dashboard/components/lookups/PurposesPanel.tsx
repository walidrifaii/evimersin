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
  useDeletePurposeMutation,
  useGetPurposesQuery,
} from "@/store/slices/admin";

export function PurposesPanel() {
  const { can } = usePermissions();
  const canCreate = can("purposes:create");
  const canUpdate = can("purposes:update");
  const canDelete = can("purposes:delete");
  const { data = [], isLoading, error } = useGetPurposesQuery();
  const [deletePurpose, deleteState] = useDeletePurposeMutation();
  const [actionError, setActionError] = useState<unknown>(null);
  const deferredQuery = useDashboardSearchQuery();

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        matchesDashboardSearch(deferredQuery, item.id, item.name, item.position),
      ),
    [data, deferredQuery],
  );

  return (
    <LookupListLayout
      title="Purposes"
      description="Manage listing purposes such as sale, rent, or investment."
      addHref={routes.lookupNew("purposes")}
      addLabel="Add purpose"
      showAdd={canCreate}
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No purposes yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No purposes match “{deferredQuery.trim()}”.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Position", "Status", "Actions"]}
          rows={filtered.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">{item.name}</td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">{item.position}</td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("purposes", item.id)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  deleting={deleteState.isLoading}
                  confirmTitle="Delete purpose?"
                  confirmMessage={`Are you sure you want to delete “${item.name}”? This action cannot be undone.`}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deletePurpose(item.id).unwrap();
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
