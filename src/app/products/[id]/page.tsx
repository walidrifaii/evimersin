import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailsView } from "@/features/products/components/PropertyDetailsView";
import { getPropertyById, propertiesListings } from "@/features/products/data";
import { config } from "@/constants/config";

type PropertyPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return propertiesListings.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    return { title: `Property | ${config.appName}` };
  }

  return {
    title: `${property.title} | ${config.appName}`,
    description: property.description,
  };
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) notFound();

  return (
    <div className="flex flex-1 flex-col bg-white">
      <PropertyDetailsView property={property} />
    </div>
  );
}
