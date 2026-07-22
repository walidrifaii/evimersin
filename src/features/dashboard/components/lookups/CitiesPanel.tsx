"use client";

import { useState } from "react";
import { routes } from "@/constants/routes";
import {
  LookupListLayout,
  LookupTable,
  RowActions,
  StatusBadge,
} from "@/features/dashboard/components/lookups/LookupManager";
import {
  useDeleteCityMutation,
  useGetCitiesQuery,
} from "@/store/slices/admin";

export function CitiesPanel() {
  const { data = [], isLoading, error } = useGetCitiesQuery();
  const [deleteCity, deleteState] = useDeleteCityMutation();
  const [actionError, setActionError] = useState<unknown>(null);

  return (
    <LookupListLayout
      title="Cities"
      description="Manage cities in Lebanon for property locations."
      addHref={routes.lookupNew("cities")}
      addLabel="Add city"
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No cities yet. Add your first city in Lebanon.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Status", "Actions"]}
          rows={data.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">{item.name}</td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("cities", item.id)}
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
