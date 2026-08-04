import {
  UserPermissionsPage,
} from "@/features/dashboard/components/UserPermissionsEditor";

export default function NewUserPermissionsPage() {
  return (
    <UserPermissionsPage
      mode="create"
      backHref="/dashboard?tab=users"
      returnHref="/dashboard?tab=users&resumeUserDraft=1"
    />
  );
}
