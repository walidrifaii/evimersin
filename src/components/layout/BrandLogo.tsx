import Image from "next/image";
import logoImage from "@/assets/images/logo.png";
import { config } from "@/constants/config";
import { Link } from "@/i18n/navigation";
import { routes } from "@/constants/routes";

export function BrandLogo() {
  return (
    <Link href={routes.home} className="group shrink-0">
      <Image
        src={logoImage}
        alt={`${config.appName} ${config.tagline}`}
        priority
        className="h-14 w-auto transition-opacity duration-200 group-hover:opacity-90 sm:h-16 lg:h-[4.5rem]"
      />
    </Link>
  );
}
