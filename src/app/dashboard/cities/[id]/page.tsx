import { CityForm } from "@/features/dashboard/components/lookups/forms/CityForm";

export default async function EditCityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CityForm id={Number(id)} />;
}
