import { CityForm } from "@/features/dashboard/components/lookups/forms/CityForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default async function EditCityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireDashboardAccess tab="cities" permission="cities:update">
      <CityForm id={Number(id)} />
    </RequireDashboardAccess>
  );
}
