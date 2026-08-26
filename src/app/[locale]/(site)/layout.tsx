import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DeferredSiteClients } from "@/components/layout/DeferredSiteClients";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { getPublicCategories } from "@/features/products/server-data";

export const revalidate = 60;

async function SiteNavbar() {
  const categories = await getPublicCategories();
  return <Navbar categories={categories} />;
}

/**
 * Do not await settings here — that blocked first HTML for seconds on cold start.
 * Settings hydrate from /api/settings after paint.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteSettingsProvider settings={null}>
      <div className="flex min-h-full flex-col">
        <Suspense
          fallback={
            <div className="h-[5rem] w-full border-b border-black/5 bg-white" />
          }
        >
          <SiteNavbar />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <DeferredSiteClients />
      </div>
    </SiteSettingsProvider>
  );
}
