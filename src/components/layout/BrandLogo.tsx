import Image from "next/image";
import { images } from "@/constants/images";
import { config } from "@/constants/config";
import { Link } from "@/i18n/navigation";
import { routes } from "@/constants/routes";

type BrandLogoProps = {
  variant?: "default" | "onDark";
};

export function BrandLogo({ variant = "default" }: BrandLogoProps) {
  const logoSrc = variant === "onDark" ? images.logoFooter : images.logo;

  return (
    <Link href={routes.home} className="group inline-flex shrink-0">
      <Image
        src={logoSrc}
        alt={`${config.appName} ${config.tagline}`}
        priority
        className="h-14 w-auto transition-opacity duration-200 group-hover:opacity-90 sm:h-16 lg:h-[4.5rem]"
      />
    </Link>
  );
}
