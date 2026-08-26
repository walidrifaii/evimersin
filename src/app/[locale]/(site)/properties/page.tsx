import type { Metadata } from "next";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { config } from "@/constants/config";
import {
  getPropertyFilterOptions,
  getPropertyListings,
} from "@/features/products/server-data";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: `Properties | ${config.appName}`,
  description:
    "Browse verified villas, apartments, studios, land, and commercial properties in Mersin with EviMersin.",
};

export const revalidate = 60;

const PropertiesPageContent = nextDynamic(
  () =>
    import("@/features/products/components/PropertiesPageContent").then(
      (mod) => ({ default: mod.PropertiesPageContent }),
    ),
  {
    loading: () => (
      <div className="mx-auto w-full px-4 py-16 text-center text-[var(--muted)] sm:px-6 lg:px-[100px]">
        Loading properties...
      </div>
    ),
  },
);

function PropertiesFallback() {
  return (
    <div className="mx-auto w-full px-4 py-16 text-center text-[var(--muted)] sm:px-6 lg:px-[100px]">
      Loading properties...
    </div>
  );
}

async function PropertiesLoader() {
  const locale = await getLocale();
  const [listings, filterOptions] = await Promise.all([
    getPropertyListings(),
    getPropertyFilterOptions(locale),
  ]);

  return (
    <PropertiesPageContent listings={listings} filterOptions={filterOptions} />
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#f5f7fa]">
      <Suspense fallback={<PropertiesFallback />}>
        <PropertiesLoader />
      </Suspense>
    </div>
  );
}
