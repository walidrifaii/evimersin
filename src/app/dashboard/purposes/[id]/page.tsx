import { PurposeForm } from "@/features/dashboard/components/lookups/forms/PurposeForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default async function EditPurposePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireDashboardAccess tab="purposes" permission="purposes:update">
      <PurposeForm id={Number(id)} />
    </RequireDashboardAccess>
  );
}
