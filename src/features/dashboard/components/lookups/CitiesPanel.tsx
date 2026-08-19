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
  useDeleteCityMutation,
  useGetCitiesQuery,
} from "@/store/slices/admin";

export function CitiesPanel() {
  const { can } = usePermissions();
  const canCreate = can("cities:create");
  const canUpdate = can("cities:update");
  const canDelete = can("cities:delete");
  const { data = [], isLoading, error } = useGetCitiesQuery();
  const [deleteCity, deleteState] = useDeleteCityMutation();
  const [actionError, setActionError] = useState<unknown>(null);
  const deferredQuery = useDashboardSearchQuery();

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        matchesDashboardSearch(
          deferredQuery,
          item.id,
          item.name,
          item.country_name,
        ),
      ),
    [data, deferredQuery],
  );

  return (
    <LookupListLayout
      title="Cities"
      description="Manage cities for property locations. Each city belongs to a country."
      addHref={routes.lookupNew("cities")}
      addLabel="Add city"
      showAdd={canCreate}
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No cities yet. Add your first city.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No cities match “{deferredQuery.trim()}”.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Country", "Status", "Actions"]}
          rows={filtered.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">{item.name}</td>
              <td className="px-5 py-3 text-[var(--muted)]">
                {item.country_name || "—"}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("cities", item.id)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  deleting={deleteState.isLoading}
                  confirmTitle="Delete city?"
                  confirmMessage={`Are you sure you want to delete “${item.name}”? This action cannot be undone.`}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deleteCity(item.id).unwrap();
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
