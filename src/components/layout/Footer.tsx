import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { config, getWhatsAppUrl } from "@/constants/config";
import { routes } from "@/constants/routes";
import { navigation } from "@/data/navigation";

const quickLinks = [
  { label: "Featured Listings", href: routes.properties },
  { label: "Hot Deals", href: routes.properties },
  { label: "Contact Us", href: routes.contact },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full bg-[var(--brand-navy)] text-white">
      <div className="mx-auto w-full px-[100px] py-14 lg:py-16">
        <div className="grid gap-12 border-b border-white/12 pb-10 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr] lg:gap-10">
          <div className="max-w-sm">
            <BrandLogo />
            <p className="mt-5 text-[15px] leading-7 text-white/72">
              Premium real estate guidance in Mersin, with verified listings,
              trusted advice, and a smooth buying experience from first contact
              to handover.
            </p>
          </div>

          <div>
            <h3 className="text-[1rem] font-semibold text-white">Navigation</h3>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-white/72 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[1rem] font-semibold text-white">Quick Links</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-white/72 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[1rem] font-semibold text-white">Contact</h3>
            <div className="mt-5 space-y-3 text-[15px] text-white/72">
              <p>
                {config.contact.addressName}
                <br />
                {config.contact.address}
              </p>
              <a
                href={`tel:${config.contact.phone}`}
                className="block transition-colors hover:text-white"
              >
                {config.contact.phoneLabel}
              </a>
              <a
                href={`mailto:${config.contact.email}`}
                className="block transition-colors hover:text-white"
              >
                {config.contact.email}
              </a>
            </div>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c9181e]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[14px] text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {config.appName}. All rights reserved.
          </p>
          <p>{config.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
