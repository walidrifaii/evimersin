import { ProductForm } from "@/features/dashboard/components/lookups/forms/ProductForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default function NewProductPage() {
  return (
    <RequireDashboardAccess tab="products" permission="products:create">
      <ProductForm />
    </RequireDashboardAccess>
  );
}
