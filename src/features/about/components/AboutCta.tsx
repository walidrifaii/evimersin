import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppUrlFromSettings } from "@/constants/config";
import { routes } from "@/constants/routes";
import { getSiteSettings } from "@/lib/site-settings";

export async function AboutCta() {
  const settings = await getSiteSettings();
  const whatsappUrl = getWhatsAppUrlFromSettings(settings);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <div className="rounded-2xl bg-[#f5f7fa] px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem]">
            Ready to find your next property?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
            Browse verified listings or reach out to our team for personalized guidance in Mersin.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={routes.properties}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-[var(--brand-blue)] px-6 text-[15px] font-semibold text-[var(--brand-blue)] transition-colors hover:bg-[#eff6ff] sm:w-auto"
            >
              Browse Properties
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e] sm:w-auto"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
