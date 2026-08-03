import { RegionForm } from "@/features/dashboard/components/lookups/forms/RegionForm";

type EditRegionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRegionPage({ params }: EditRegionPageProps) {
  const { id } = await params;
  return <RegionForm id={Number(id)} />;
}
