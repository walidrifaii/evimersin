import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";
import { routes } from "@/constants/routes";

export function PropertiesHeader() {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-[1.85rem] font-bold leading-tight tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2.15rem] lg:text-[2.4rem]">
        Properties
      </h1>
      <nav aria-label="Breadcrumb" className="mt-2 flex items-center gap-1.5 text-[13px] sm:text-[14px]">
        <Link
          href={routes.home}
          className="font-medium text-[var(--brand-blue)] transition-colors hover:text-[#1d4ed8]"
        >
          Home
        </Link>
        <HiChevronRight className="h-3.5 w-3.5 text-[#9ca3af]" aria-hidden="true" />
        <span className="font-medium text-[var(--muted)]">Properties</span>
      </nav>
    </div>
  );
}
