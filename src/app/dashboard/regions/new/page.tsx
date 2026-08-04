import { RegionForm } from "@/features/dashboard/components/lookups/forms/RegionForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default function NewRegionPage() {
  return (
    <RequireDashboardAccess tab="regions" permission="regions:create">
      <RegionForm />
    </RequireDashboardAccess>
  );
}
