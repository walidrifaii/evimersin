import { RegionForm } from "@/features/dashboard/components/lookups/forms/RegionForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default async function EditRegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireDashboardAccess tab="regions" permission="regions:update">
      <RegionForm id={Number(id)} />
    </RequireDashboardAccess>
  );
}
