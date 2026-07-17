import { PurposeForm } from "@/features/dashboard/components/lookups/forms/PurposeForm";

export default async function EditPurposePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PurposeForm id={Number(id)} />;
}
