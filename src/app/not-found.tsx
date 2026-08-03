import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div>
      <h2>{t("title")}</h2>
      <p>{t("description")}</p>
      <Link href="/">{t("returnHome")}</Link>
    </div>
  );
}
