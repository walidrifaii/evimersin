import type { useTranslations } from "next-intl";
import type { FilterOption } from "@/features/products/types";

type ProductsTranslator = ReturnType<typeof useTranslations<"products">>;
type HomeTranslator = ReturnType<typeof useTranslations<"home">>;

const homeLabelKeys: Record<string, Parameters<HomeTranslator>[0]> = {
  "All Cities": "allCities",
  "All Regions": "allRegions",
  "All Types": "allTypes",
  "Buy / Rent": "buyRent",
  "For Sale": "forSale",
  "For Rent": "forRent",
  "Any Price": "anyPrice",
};

const productsLabelKeys: Record<string, Parameters<ProductsTranslator>[0]> = {
  "All Cities": "allCities",
  "All Regions": "allRegions",
  "All Types": "allTypes",
  "Buy / Rent": "buyRent",
  "For Sale": "forSale",
  "For Rent": "forRent",
  "Newest": "sortNewest",
  "Price: Low to High": "sortPriceAsc",
  "Price: High to Low": "sortPriceDesc",
  "Featured First": "sortFeatured",
};

function stripCountSuffix(label: string) {
  const match = label.match(/^(.+?)\s*\((\d+)\)$/);
  if (!match) return { base: label.trim(), count: undefined as string | undefined };
  return { base: match[1].trim(), count: match[2] };
}

function translateBaseLabel<T extends Record<string, string>>(
  map: Record<string, keyof T & string>,
  t: (key: keyof T & string) => string,
  label: string,
) {
  const { base, count } = stripCountSuffix(label);
  const key = map[base];
  const translated = key ? t(key as keyof T & string) : base;
  return count !== undefined ? `${translated} (${count})` : translated;
}

export function translateFilterLabel(
  t: ProductsTranslator,
  label: string,
): string {
  return translateBaseLabel(productsLabelKeys, t, label);
}

export function translateHomeFilterLabel(
  t: HomeTranslator,
  label: string,
): string {
  return translateBaseLabel(homeLabelKeys, t, label);
}

export function formatTranslatedFilterOption(
  option: FilterOption,
  translateLabel: (label: string) => string,
) {
  const translated = translateLabel(option.label);
  if (typeof option.count === "number") {
    return `${translated} (${option.count})`;
  }
  return translated;
}

export const ANY_PRICE_KEY = "any";

export function getPriceRangeKeys(maxPrice: number) {
  return [
    ANY_PRICE_KEY,
    "0-50000",
    "50000-100000",
    "100000-200000",
    "200000-500000",
    `500000-${maxPrice}`,
  ] as const;
}

export function formatPriceRangeLabel(
  key: string,
  maxPrice: number,
  t: HomeTranslator,
): string {
  if (key === ANY_PRICE_KEY) return t("anyPrice");
  if (key === "0-50000") return "$0 - $50,000";
  if (key === "50000-100000") return "$50,000 - $100,000";
  if (key === "100000-200000") return "$100,000 - $200,000";
  if (key === "200000-500000") return "$200,000 - $500,000";
  if (key === `500000-${maxPrice}`) {
    return `$500,000 - $${maxPrice.toLocaleString("en-US")}`;
  }
  return key;
}

export function parsePriceRangeKey(key: string) {
  if (key === ANY_PRICE_KEY) {
    return { priceMin: null as number | null, priceMax: null as number | null };
  }
  const [minRaw, maxRaw] = key.split("-");
  return {
    priceMin: Number(minRaw),
    priceMax: Number(maxRaw),
  };
}
