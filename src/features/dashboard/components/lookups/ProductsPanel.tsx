"use client";

import { useMemo, useState } from "react";
import { routes } from "@/constants/routes";
import { SafeImage } from "@/components/ui/SafeImage";
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
  formatProductPrice,
  hasActiveDiscount,
} from "@/lib/product-pricing";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/store/slices/admin";

export function ProductsPanel() {
  const { can } = usePermissions();
  const canCreate = can("products:create");
  const canUpdate = can("products:update");
  const canDelete = can("products:delete");
  const { data = [], isLoading, error } = useGetProductsQuery();
  const [deleteProduct, deleteState] = useDeleteProductMutation();
  const [actionError, setActionError] = useState<unknown>(null);
  const deferredQuery = useDashboardSearchQuery();

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        matchesDashboardSearch(
          deferredQuery,
          item.id,
          item.name,
          item.category_name,
          item.city_name,
          item.purpose_name,
          item.price,
          item.final_price,
        ),
      ),
    [data, deferredQuery],
  );

  return (
    <LookupListLayout
      title="Residential Units"
      description="Manage residential units with category, purpose, city, and gallery images."
      addHref={routes.lookupNew("products")}
      addLabel="Add residential unit"
      showAdd={canCreate}
      loading={isLoading}
      error={actionError ?? error}
    >
      {data.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No residential units yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
          No residential units match “{deferredQuery.trim()}”.
        </div>
      ) : (
        <LookupTable
          headers={[
            "ID",
            "Image",
            "Name",
            "Price",
            "Featured",
            "Hot deal",
            "Category",
            "City",
            "Status",
            "Actions",
          ]}
          rows={filtered.map((item) => (
            <tr key={item.id} className="border-t border-[#eef2f7]">
              <td className="px-5 py-3 text-[var(--muted)]">{item.id}</td>
              <td className="px-5 py-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-[#e5eaf2] bg-white">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              </td>
              <td className="px-5 py-3 font-semibold text-[var(--brand-navy)]">
                {item.name}
              </td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {formatProductPrice(item.final_price)}
                  </span>
                  {hasActiveDiscount(item.discount_type, item.discount_value) ? (
                    <span className="text-[12px] text-[var(--muted)] line-through">
                      {formatProductPrice(item.price)}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.is_featured === 1
                      ? "bg-[#eff6ff] text-[var(--brand-blue)]"
                      : "bg-[#f1f5f9] text-[#64748b]"
                  }`}
                >
                  {item.is_featured === 1 ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    hasActiveDiscount(item.discount_type, item.discount_value)
                      ? "bg-[#fff7ed] text-[#c2410c]"
                      : "bg-[#f1f5f9] text-[#64748b]"
                  }`}
                >
                  {hasActiveDiscount(item.discount_type, item.discount_value)
                    ? "Yes"
                    : "No"}
                </span>
              </td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">
                {item.category_name}
              </td>
              <td className="px-5 py-3 text-[var(--brand-navy)]">
                {item.city_name}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3">
                <RowActions
                  editHref={routes.lookupEdit("products", item.id)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  deleting={deleteState.isLoading}
                  confirmTitle="Delete residential unit?"
                  confirmMessage={`Are you sure you want to delete “${item.name}”? This action cannot be undone.`}
                  onDelete={async () => {
                    setActionError(null);
                    try {
                      await deleteProduct(item.id).unwrap();
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
