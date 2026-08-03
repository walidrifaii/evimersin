"use client";

import { useTranslations } from "next-intl";
import { HiChevronRight } from "react-icons/hi";
import { Link } from "@/i18n/navigation";
import { routes } from "@/constants/routes";

export function PropertiesHeader() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2.15rem] lg:text-[2.4rem]">
        {t("title")}
      </h1>
      <nav aria-label="Breadcrumb" className="mt-2 flex items-center gap-1.5 text-[13px] sm:text-[14px]">
        <Link
          href={routes.home}
          className="font-medium text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
        >
          {t("breadcrumbHome")}
        </Link>
        <HiChevronRight className="h-3.5 w-3.5 text-[#9ca3af]" aria-hidden="true" />
        <span className="font-medium text-[var(--muted)]">{tCommon("properties")}</span>
      </nav>
    </div>
  );
}
