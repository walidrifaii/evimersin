import { CountryForm } from "@/features/dashboard/components/lookups/forms/CountryForm";

export default async function EditCountryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CountryForm id={Number(id)} />;
}
