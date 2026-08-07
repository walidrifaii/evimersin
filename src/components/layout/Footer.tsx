"use client";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { FooterSocialLinks } from "@/components/layout/FooterSocialLinks";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { config, getWhatsAppUrlFromSettings } from "@/constants/config";
import { Link } from "@/i18n/navigation";
import { routes } from "@/constants/routes";
import { useAppLocale } from "@/components/layout/LocaleAttributes";
import { useTranslations } from "next-intl";

const navKeys = [
  { key: "home", href: routes.home },
  { key: "properties", href: routes.properties },
  { key: "aboutUs", href: routes.about },
  { key: "howItWorks", href: routes.howItWorks },
  { key: "contact", href: routes.contact },
] as const;

export function Footer() {
  const settings = useSiteSettings();
  const locale = useAppLocale();
  const isRtl = locale === "ar";
  const whatsappUrl = getWhatsAppUrlFromSettings(settings);
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const quickLinks = [
    { key: "featuredListings", href: routes.properties },
    { key: "hotDeals", href: routes.properties },
    { key: "contactUs", href: routes.contact },
  ] as const;

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-auto w-full bg-[var(--brand-navy)] text-white"
    >
      <div className="mx-auto w-full px-4 py-12 sm:px-6 sm:py-14 md:px-4 lg:px-[100px] lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-white/12 pb-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr] lg:gap-10">
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <BrandLogo variant="onDark" />
            <div className="mt-5 sm:mt-6">
              <p className="text-[14px] leading-7 text-white/72 sm:text-[15px]">
                {t("description")}
              </p>
              <FooterSocialLinks className="mt-4 sm:mt-5" />
            </div>
          </div>

          <div>
            <h3 className="text-[0.95rem] font-semibold text-white sm:text-[1rem]">
              {t("navigation")}
            </h3>
            <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {navKeys.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-white/72 transition-colors hover:text-white sm:text-[15px]"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.95rem] font-semibold text-white sm:text-[1rem]">
              {t("quickLinks")}
            </h3>
            <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {quickLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-white/72 transition-colors hover:text-white sm:text-[15px]"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-[0.95rem] font-semibold text-white sm:text-[1rem]">
              {t("contact")}
            </h3>
            <div className="mt-4 space-y-2.5 text-[14px] text-white/72 sm:mt-5 sm:space-y-3 sm:text-[15px]">
              <p>
                {config.contact.addressName}
                <br />
                {config.contact.address}
              </p>
              <a
                href={`tel:${settings.phone}`}
                className="block transition-colors hover:text-white"
              >
                {settings.phone}
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="block transition-colors hover:text-white"
              >
                {settings.email}
              </a>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c9181e] sm:mt-6"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {tCommon("chatOnWhatsapp")}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-[13px] text-white/60 sm:gap-3 sm:text-[14px] lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {config.appName}. {t("allRightsReserved")}
          </p>
          <p>
            {t("poweredBy")}{" "}
            <a
              href="https://www.amctag.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-white"
            >
              amctag
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
