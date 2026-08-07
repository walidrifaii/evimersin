import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa";
import { HiChevronLeft } from "react-icons/hi";
import { BathIcon } from "@/components/icons/BathIcon";
import { BedIcon } from "@/components/icons/BedIcon";
import { SquareMeterIcon } from "@/components/icons/SquareMeterIcon";
import { getWhatsAppUrlFromSettings } from "@/constants/config";
import {
  formatSpecValue,
  getSpecFieldsForCategory,
} from "@/constants/property-specs";
import { routes } from "@/constants/routes";
import { PropertyGallery } from "@/features/products/components/PropertyGallery";
import type { PropertyListing } from "@/features/products/types";
import { getSiteSettings } from "@/lib/site-settings";

type PropertyDetailsViewProps = {
  property: PropertyListing;
};

export async function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const settings = await getSiteSettings();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const propertyUrl = `${appUrl}${property.href}`;
  const whatsappUrl = getWhatsAppUrlFromSettings(
    settings,
    t("whatsappMessage", { title: property.title, url: propertyUrl }),
  );
  const specRows = getSpecFieldsForCategory(property.propertyType)
    .map((field) => {
      const formatted = formatSpecValue(field, property.specs?.[field.key]);
      if (!formatted) return null;
      return { label: field.label, value: formatted };
    })
    .filter((item): item is { label: string; value: string } => item !== null);

  return (
    <section className="relative w-full bg-white pb-28 lg:pb-16">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 sm:py-8 md:px-4 lg:px-[100px] lg:py-10">
        <Link
          href={routes.properties}
          className="mb-4 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-blue)] sm:mb-6"
        >
          <HiChevronLeft className="h-4 w-4" aria-hidden="true" />
          {tCommon("backToProperties")}
        </Link>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start lg:gap-12">
          <PropertyGallery title={property.title} images={property.images} />

          <div className="lg:sticky lg:top-28">
            <div className="bg-white lg:rounded-2xl lg:border lg:border-[#e8edf5] lg:p-7 lg:shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
              {property.city || property.region ? (
                <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
                  {property.city ? (
                    <span className="inline-flex rounded-md bg-[var(--brand-blue)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                      {property.city}
                    </span>
                  ) : null}
                  {property.region ? (
                    <span className="inline-flex rounded-md bg-[var(--brand-navy)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                      {property.region}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="mb-2 text-[13px] font-bold tracking-[0.02em] text-[var(--brand-navy)] sm:mb-2.5 sm:text-[14px]">
                {t("ref")} #{property.id}
              </p>
              <h1 className="text-[1.55rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.9rem] lg:text-[2.1rem]">
                {property.title}
              </h1>
              <p className="mt-2 text-[14px] text-[var(--muted)] sm:text-[15px]">
                {property.propertyType ? (
                  <span>
                    {t("propertyTypeLabel")}{" "}
                    <span className="font-semibold text-[var(--brand-red)]">
                      {property.propertyType}
                    </span>
                  </span>
                ) : null}
                {property.propertyType && property.purpose ? " · " : null}
                {property.purpose ? (
                  <span>
                    {t("purposeLabel")}{" "}
                    <span className="font-semibold text-[var(--brand-navy)]">
                      {property.purpose}
                    </span>
                  </span>
                ) : null}
              </p>

              <div className="mt-5">
                <p className="text-[1.7rem] font-bold leading-none text-[var(--brand-blue)] sm:text-[2rem]">
                  {property.price}
                </p>
                {property.originalPrice ? (
                  <p className="mt-1.5 text-[15px] font-medium text-[var(--muted)] line-through">
                    {property.originalPrice}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#eef2f7] py-4 text-[13px] font-medium text-[var(--muted)] sm:mt-6 sm:gap-x-6 sm:text-[14px]">
                {property.beds > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <BedIcon className="h-4 w-4" />
                    {t("beds", { count: property.beds })}
                  </span>
                ) : null}
                {property.baths > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <BathIcon className="h-4 w-4" />
                    {t("baths", { count: property.baths })}
                  </span>
                ) : null}
                {property.sqm > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <SquareMeterIcon className="h-4 w-4" />
                    {t("sqm", { count: property.sqm })}
                  </span>
                ) : null}
              </div>

              {specRows.length > 0 ? (
                <div className="mt-5 sm:mt-6">
                  <h2 className="text-[1.1rem] font-bold text-[var(--brand-navy)] sm:text-[1.25rem]">
                    {t("propertyDetails")}
                  </h2>
                  <dl className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                    {specRows.map((row) => (
                      <div
                        key={row.label}
                        className="rounded-lg border border-[#eef2f7] bg-[#f8fafc] px-2.5 py-1.5"
                      >
                        <dt className="text-[11px] font-medium leading-tight text-[var(--muted)]">
                          {row.label}
                        </dt>
                        <dd className="mt-0.5 text-[13px] font-semibold leading-tight text-[var(--brand-navy)]">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <div className="mt-5 sm:mt-6">
                <h2 className="text-[1.1rem] font-bold text-[var(--brand-navy)] sm:text-[1.25rem]">
                  {t("description")}
                </h2>
                <p className="mt-2.5 text-[14px] leading-7 text-[var(--muted)] sm:mt-3 sm:text-[15px]">
                  {property.description}
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 hidden h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1ebe57] lg:inline-flex"
              >
                <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
                {tCommon("contactOnWhatsapp")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={tCommon("contactOnWhatsapp")}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 active:scale-95 lg:hidden"
      >
        <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
      </a>
    </section>
  );
}
