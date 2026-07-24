"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { config, getWhatsAppUrlFromSettings } from "@/constants/config";
import { routes } from "@/constants/routes";
import { navigation } from "@/data/navigation";

const quickLinks = [
  { label: "Featured Listings", href: routes.properties },
  { label: "Hot Deals", href: routes.properties },
  { label: "Contact Us", href: routes.contact },
];

export function Footer() {
  const settings = useSiteSettings();
  const whatsappUrl = getWhatsAppUrlFromSettings(settings);

  return (
    <footer className="mt-auto w-full bg-[var(--brand-navy)] text-white">
      <div className="mx-auto w-full px-4 py-12 sm:px-6 sm:py-14 md:px-4 lg:px-[100px] lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-white/12 pb-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr] lg:gap-10">
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <BrandLogo />
            <p className="mt-5 text-[14px] leading-7 text-white/72 sm:text-[15px]">
              Premium real estate guidance in Mersin, with verified listings,
              trusted advice, and a smooth buying experience from first contact
              to handover.
            </p>
          </div>

          <div>
            <h3 className="text-[0.95rem] font-semibold text-white sm:text-[1rem]">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-white/72 transition-colors hover:text-white sm:text-[15px]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.95rem] font-semibold text-white sm:text-[1rem]">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-white/72 transition-colors hover:text-white sm:text-[15px]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-[0.95rem] font-semibold text-white sm:text-[1rem]">
              Contact
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
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-[13px] text-white/60 sm:gap-3 sm:text-[14px] lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {config.appName}. All rights reserved.
          </p>
          <p>
            Powered by{" "}
            <a
              href="https://www.amctag.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-white"
            >
              Amctag
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
