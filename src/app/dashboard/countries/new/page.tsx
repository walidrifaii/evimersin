import { CountryForm } from "@/features/dashboard/components/lookups/forms/CountryForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default function NewCountryPage() {
  return (
    <RequireDashboardAccess
      tab="countries"
      permission={["countries:create", "cities:create"]}
    >
      <CountryForm />
    </RequireDashboardAccess>
  );
}
