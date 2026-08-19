import { CountryForm } from "@/features/dashboard/components/lookups/forms/CountryForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default async function EditCountryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireDashboardAccess
      tab="countries"
      permission={["countries:update", "cities:update"]}
    >
      <CountryForm id={Number(id)} />
    </RequireDashboardAccess>
  );
}
