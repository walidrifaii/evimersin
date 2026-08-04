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
  useDeleteRegionMutation,
  useGetRegionsQuery,
} from "@/store/slices/admin";

export function RegionsPanel() {
  const { can } = usePermissions();
  const canCreate = can("regions:create");
  const canUpdate = can("regions:update");
  const canDelete = can("regions:delete");
  const { data = [], isLoading, error } = useGetRegionsQuery();
  const [deleteRegion, deleteState] = useDeleteRegionMutation();
  const [actionError, setActionError] = useState<unknown>(null);
  const deferredQuery = useDashboardSearchQuery();

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        matchesDashboardSearch(
          deferredQuery,
          item.id,
          item.name,
          item.city_name,
        ),
      ),
    [data, deferredQuery],
  );

  return (
    <LookupListLayout
      title="Regions"
      description="Manage regions within each city for property locations and filters."
      addHref={routes.lookupNew("regions")}
      addLabel="Add region"
      showAdd={canCreate}
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No regions yet. Add your first region under a city.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No regions match “{deferredQuery.trim()}”.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "City", "Status", "Actions"]}
          rows={filtered.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">
                {item.name}
              </td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">
                {item.city_name}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("regions", item.id)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  deleting={deleteState.isLoading}
                  confirmTitle="Delete region?"
                  confirmMessage={`Are you sure you want to delete “${item.name}”? This action cannot be undone.`}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deleteRegion(item.id).unwrap();
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
