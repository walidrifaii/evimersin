import {
  categoryRepository,
  cityRepository,
  countryRepository,
  purposeRepository,
} from "@/server/database/repositories/lookup.repository";
import { productRepository } from "@/server/database/repositories/product.repository";
import type {
  AnalyticsActivity,
  AnalyticsKpi,
  AnalyticsProductRow,
  DashboardAnalytics,
} from "@/server/types/analytics.types";
import { hasActiveDiscount } from "@/lib/product-pricing";
import { toAbsoluteImageUrl } from "@/lib/image-url";
import type { Product } from "@/server/types/product.types";

function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isHotDeal(product: Product) {
  return (
    product.is_hot_deal === 1 ||
    hasActiveDiscount(product.discount_type, product.discount_value)
  );
}

function toProductRow(product: Product): AnalyticsProductRow {
  return {
    id: product.id,
    name: product.name,
    city_name: product.city_name,
    category_name: product.category_name,
    purpose_name: product.purpose_name,
    price: product.price,
    final_price: product.final_price,
    image: toAbsoluteImageUrl(product.image),
    status: product.status,
    is_hot_deal: isHotDeal(product),
    is_featured: product.is_featured === 1,
    date_created: product.date_created,
  };
}

function buildKpis(input: {
  activeProducts: number;
  featuredProducts: number;
  hotDeals: number;
}): AnalyticsKpi[] {
  return [
    {
      id: "active-products",
      label: "Active Listings",
      value: String(input.activeProducts),
      change: "Live",
      trend: "neutral",
      hint: "Published on the website",
    },
    {
      id: "featured-products",
      label: "Featured Properties",
      value: String(input.featuredProducts),
      change: input.featuredProducts > 0 ? "Homepage" : "None",
      trend: input.featuredProducts > 0 ? "up" : "neutral",
      hint: "Shown in Featured Properties section",
    },
    {
      id: "hot-deals",
      label: "Hot Deals",
      value: String(input.hotDeals),
      change: input.hotDeals > 0 ? "On sale" : "None",
      trend: input.hotDeals > 0 ? "up" : "neutral",
      hint: "Discounted listings on the website",
    },
  ];
}

function buildProductsByDay(products: Product[]) {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }

  const counts = new Map(days.map((day) => [day, 0]));

  for (const product of products) {
    const key = toDateKey(product.date_created);
    if (!key || !counts.has(key)) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return days.map((day) => ({
    label: formatDayLabel(day),
    value: counts.get(day) ?? 0,
  }));
}

function buildGroupedCounts(
  products: Product[],
  getLabel: (product: Product) => string,
) {
  const counts = new Map<string, number>();

  for (const product of products) {
    const label = getLabel(product) || "Other";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function buildActivity(products: Product[]): AnalyticsActivity[] {
  return [...products]
    .sort((a, b) => {
      const aTime = new Date(a.date_created).getTime();
      const bTime = new Date(b.date_created).getTime();
      return bTime - aTime;
    })
    .slice(0, 6)
    .map((product) => ({
      id: `product-${product.id}`,
      title: product.status === 1 ? "Listing published" : "Listing saved",
      detail: `${product.name} · ${product.city_name} · ${product.category_name}`,
      time: formatActivityTime(product.date_created),
    }));
}

export const analyticsService = {
  async getOverview(): Promise<DashboardAnalytics> {
    const [products, categories, cities, purposes, countries] = await Promise.all([
      productRepository.findAll(),
      categoryRepository.findAll(),
      cityRepository.findAll(),
      purposeRepository.findAll(),
      countryRepository.findAll(),
    ]);

    const activeProducts = products.filter((product) => product.status === 1);
    const featuredProducts = activeProducts.filter(
      (product) => product.is_featured === 1,
    );
    const hotDealProducts = activeProducts.filter(isHotDeal);

    return {
      kpis: buildKpis({
        activeProducts: activeProducts.length,
        featuredProducts: featuredProducts.length,
        hotDeals: hotDealProducts.length,
      }),
      summary: {
        countries: countries.length,
        cities: cities.length,
        categories: categories.length,
        purposes: purposes.length,
        featured: featuredProducts.length,
        hotDeals: hotDealProducts.length,
        inactive: products.length - activeProducts.length,
      },
      productsByDay: buildProductsByDay(products),
      productsByCategory: buildGroupedCounts(
        activeProducts,
        (product) => product.category_name,
      ),
      productsByPurpose: buildGroupedCounts(
        activeProducts,
        (product) => product.purpose_name,
      ),
      recentProducts: [...activeProducts]
        .sort((a, b) => b.id - a.id)
        .slice(0, 6)
        .map(toProductRow),
      hotDeals: hotDealProducts
        .sort((a, b) => b.id - a.id)
        .slice(0, 4)
        .map(toProductRow),
      featuredProducts: featuredProducts
        .sort((a, b) => b.id - a.id)
        .slice(0, 4)
        .map(toProductRow),
      activity: buildActivity(products),
    };
  },
};
