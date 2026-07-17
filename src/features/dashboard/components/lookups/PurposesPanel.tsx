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
  useDeletePurposeMutation,
  useGetPurposesQuery,
} from "@/store/slices/admin";

export function PurposesPanel() {
  const { data = [], isLoading, error } = useGetPurposesQuery();
  const [deletePurpose, deleteState] = useDeletePurposeMutation();
  const [actionError, setActionError] = useState<unknown>(null);

  return (
    <LookupListLayout
      title="Purposes"
      description="Manage listing purposes such as sale, rent, or investment."
      addHref={routes.lookupNew("purposes")}
      addLabel="Add purpose"
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No purposes yet.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Position", "Status", "Actions"]}
          rows={data.map((item) => (
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
                  deleting={deleteState.isLoading}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deletePurpose(item.id).unwrap();
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
