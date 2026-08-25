import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GuestFirebaseNotifications } from "@/components/announcements/GuestFirebaseNotifications";
import { VisitTracker } from "@/components/visits/VisitTracker";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { getPublicCategories } from "@/features/products/server-data";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getPublicCategories(),
  ]);

  return (
    <SiteSettingsProvider settings={settings}>
      <div className="flex min-h-full flex-col">
        <Suspense
          fallback={
            <div className="h-[5rem] w-full border-b border-black/5 bg-white" />
          }
        >
          <Navbar categories={categories} />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <VisitTracker />
        <GuestFirebaseNotifications />
      </div>
    </SiteSettingsProvider>
  );
}
