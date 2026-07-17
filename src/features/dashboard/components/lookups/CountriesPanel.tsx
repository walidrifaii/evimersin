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
  useDeleteCountryMutation,
  useGetCountriesQuery,
} from "@/store/slices/admin";

export function CountriesPanel() {
  const { data = [], isLoading, error } = useGetCountriesQuery();
  const [deleteCountry, deleteState] = useDeleteCountryMutation();
  const [actionError, setActionError] = useState<unknown>(null);

  return (
    <LookupListLayout
      title="Countries"
      description="Manage countries used by cities and property locations."
      addHref={routes.lookupNew("countries")}
      addLabel="Add country"
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No countries yet.
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
                  editHref={routes.lookupEdit("countries", item.id)}
                  deleting={deleteState.isLoading}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deleteCountry(item.id).unwrap();
                    } catch (err) {
                      setActionError(err);
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
