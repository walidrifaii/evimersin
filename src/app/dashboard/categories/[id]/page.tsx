import { CategoryForm } from "@/features/dashboard/components/lookups/forms/CategoryForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireDashboardAccess tab="categories" permission="categories:update">
      <CategoryForm id={Number(id)} />
    </RequireDashboardAccess>
  );
}
