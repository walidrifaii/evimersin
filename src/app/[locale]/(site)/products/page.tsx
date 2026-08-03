import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertiesPageContent } from "@/features/products/components/PropertiesPageContent";
import { config } from "@/constants/config";
import {
  getPropertyFilterOptions,
  getPropertyListings,
} from "@/features/products/server-data";

export const metadata: Metadata = {
  title: `Properties | ${config.appName}`,
  description:
    "Browse verified villas, apartments, studios, land, and commercial properties in Mersin with EviMersin.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [listings, filterOptions] = await Promise.all([
    getPropertyListings(),
    getPropertyFilterOptions(),
  ]);

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
