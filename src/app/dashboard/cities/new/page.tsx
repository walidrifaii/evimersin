import { CityForm } from "@/features/dashboard/components/lookups/forms/CityForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default function NewCityPage() {
  return (
    <RequireDashboardAccess tab="cities" permission="cities:create">
      <CityForm />
    </RequireDashboardAccess>
  );
}
