import { CategoryForm } from "@/features/dashboard/components/lookups/forms/CategoryForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default function NewCategoryPage() {
  return (
    <RequireDashboardAccess tab="categories" permission="categories:create">
      <CategoryForm />
    </RequireDashboardAccess>
  );
}
