import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertiesPageContent } from "@/features/products/components/PropertiesPageContent";
import { config } from "@/constants/config";
import { buildPropertyFilterOptions } from "@/features/products/data";
import { getPropertyListings } from "@/features/products/server-data";

export const metadata: Metadata = {
  title: `Properties | ${config.appName}`,
  description:
    "Browse verified villas, apartments, studios, land, and commercial properties in Mersin with EviMersin.",
};

export const revalidate = 60;

export default async function ProductsPage() {
  const listings = await getPropertyListings();
  const filterOptions = buildPropertyFilterOptions(listings);

  return (
    <div className="flex flex-1 flex-col bg-[#f5f7fa]">
      <Suspense
        fallback={
          <div className="mx-auto w-full px-4 py-16 text-center text-[var(--muted)] sm:px-6 lg:px-[100px]">
            Loading properties...
          </div>
        }
      >
        <PropertiesPageContent listings={listings} filterOptions={filterOptions} />
      </Suspense>
    </div>
  );
}
