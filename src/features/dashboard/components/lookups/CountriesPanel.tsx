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
  useDeleteCountryMutation,
  useGetCountriesQuery,
} from "@/store/slices/admin";

export function CountriesPanel() {
  const { can } = usePermissions();
  const canCreate = can("countries:create") || can("cities:create");
  const canUpdate = can("countries:update") || can("cities:update");
  const canDelete = can("countries:delete") || can("cities:delete");
  const { data = [], isLoading, error } = useGetCountriesQuery();
  const [deleteCountry, deleteState] = useDeleteCountryMutation();
  const [actionError, setActionError] = useState<unknown>(null);
  const deferredQuery = useDashboardSearchQuery();

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        matchesDashboardSearch(deferredQuery, item.id, item.name),
      ),
    [data, deferredQuery],
  );

  return (
    <LookupListLayout
      title="Countries"
      description="Add countries used by cities and the website property filters."
      addHref={routes.lookupNew("countries")}
      addLabel="Add country"
      showAdd={canCreate}
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No countries yet. Add your first country.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No countries match “{deferredQuery.trim()}”.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Status", "Actions"]}
          rows={filtered.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">
                {item.name}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("countries", item.id)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  deleting={deleteState.isLoading}
                  confirmTitle="Delete country?"
                  confirmMessage={`Are you sure you want to delete “${item.name}”? This action cannot be undone.`}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deleteCountry(item.id).unwrap();
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
