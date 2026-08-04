import { PurposeForm } from "@/features/dashboard/components/lookups/forms/PurposeForm";
import { RequireDashboardAccess } from "@/features/dashboard/components/RequireDashboardAccess";

export default function NewPurposePage() {
  return (
    <RequireDashboardAccess tab="purposes" permission="purposes:create">
      <PurposeForm />
    </RequireDashboardAccess>
  );
}
