"use client";

import Image from "next/image";
import { useState } from "react";
import { routes } from "@/constants/routes";
import {
  LookupListLayout,
  LookupTable,
  RowActions,
  StatusBadge,
} from "@/features/dashboard/components/lookups/LookupManager";
import { toDisplayImageSrc } from "@/lib/image-url";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/store/slices/admin";

export function CategoriesPanel() {
  const { data = [], isLoading, error } = useGetCategoriesQuery();
  const [deleteCategory, deleteState] = useDeleteCategoryMutation();
  const [actionError, setActionError] = useState<unknown>(null);

  return (
    <LookupListLayout
      title="Categories"
      description="Manage property categories used across listings and filters."
      addHref={routes.lookupNew("categories")}
      addLabel="Add category"
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No categories yet.
        </div>
      ) : (
        <LookupTable
          headers={["ID", "Name", "Position", "Icon", "Status", "Actions"]}
          rows={data.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">{item.name}</td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">{item.position}</td>
              <td className="px-5 py-3">
                {item.icon ? (
                  <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-[#e5eaf2] bg-white">
                    <Image
                      src={toDisplayImageSrc(item.icon)}
                      alt={`${item.name} icon`}
                      fill
                      className="object-cover"
                      sizes="44px"
                      unoptimized={toDisplayImageSrc(item.icon).endsWith(".svg")}
                    />
                  </div>
                ) : (
                  <span className="text-[var(--muted)]">-</span>
                )}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("categories", item.id)}
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
