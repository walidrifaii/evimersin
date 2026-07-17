import { CategoryForm } from "@/features/dashboard/components/lookups/forms/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryForm id={Number(id)} />;
}
