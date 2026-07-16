import { routes } from "@/constants/routes";

export const navigation = [
  { label: "Home", href: routes.home },
  { label: "Properties", href: routes.properties, hasDropdown: true },
  { label: "About Us", href: routes.about },
  { label: "How It Works", href: routes.howItWorks },
  { label: "Contact", href: routes.contact },
] as const;
