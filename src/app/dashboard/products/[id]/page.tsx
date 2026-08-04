import { ProductForm } from "@/features/dashboard/components/lookups/forms/ProductForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireDashboardAccess tab="products" permission="products:update">
      <ProductForm id={Number(id)} />
    </RequireDashboardAccess>
  );
}
