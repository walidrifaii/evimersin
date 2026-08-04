import { UserPermissionsEditPage } from "@/features/dashboard/components/UserPermissionsEditor";

export default async function EditUserPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  return (
    <UserPermissionsEditPage
      mode="edit"
      userId={userId}
      backHref="/dashboard?tab=users"
      returnHref={`/dashboard?tab=users&resumeUserDraft=1&editUserId=${userId}`}
    />
  );
}
