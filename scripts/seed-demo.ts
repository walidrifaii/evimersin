import { closePool, query } from "@/server/database/connection";
import {
  categoryRepository,
  cityRepository,
  countryRepository,
  purposeRepository,
} from "@/server/database/repositories/lookup.repository";
import {
  productImageRepository,
  productRepository,
} from "@/server/database/repositories/product.repository";
import { loadEnv, setupDatabase } from "./load-env";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

const COVER_IMAGES = [
  `${APP_URL}/uploads/products/16e546d2-9ea3-4ed3-bc35-5a8f0bc49ee8.jpg`,
  `${APP_URL}/uploads/products/8fa18561-17a3-42b6-81b3-c47f6e423104.jpg`,
  `${APP_URL}/uploads/products/b7b4cf8d-c191-415a-9c80-df9a499af660.png`,
];

const GALLERY_IMAGES = [
  `${APP_URL}/uploads/products/gallery/47b60825-a870-40d7-8d03-b89042caacec.jpg`,
  `${APP_URL}/uploads/products/gallery/502d5caf-ed8d-4417-bcfe-30c16db440fd.jpg`,
  `${APP_URL}/uploads/products/gallery/9861e57f-48ab-4e05-bfe0-919a2ea44316.jpg`,
];

async function ensureByName<T extends { id: number; name: string }>(
  list: T[],
  name: string,
  create: () => Promise<number>,
) {
  const existing = list.find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing.id;
  return create();
}

async function productExists(name: string) {
  const rows = await query<Array<{ id: number }>>(
    "SELECT id FROM products WHERE name = :name LIMIT 1",
    { name },
  );
  return Boolean(rows[0]);
}

async function seedDemo() {
  loadEnv();
  await setupDatabase();

  const countries = await countryRepository.findAll();
  const countryId = await ensureByName(countries, "Turkey", () =>
    countryRepository.create({ name: "Turkey", status: 1 }),
  );

  const cities = await cityRepository.findAll();
  const cityId = await ensureByName(cities, "Mersin", () =>
    cityRepository.create({
      name: "Mersin",
      country_id: countryId,
      status: 1,
    }),
  );

  const purposes = await purposeRepository.findAll();
  const salePurposeId = await ensureByName(purposes, "Sale", () =>
    purposeRepository.create({ name: "Sale", status: 1, position: 1 }),
  );
  const rentPurposeId = await ensureByName(
    await purposeRepository.findAll(),
    "Rent",
    () => purposeRepository.create({ name: "Rent", status: 1, position: 2 }),
  );

  const categories = await categoryRepository.findAll();
  const villaCategoryId = await ensureByName(categories, "Villa", () =>
    categoryRepository.create({
      name: "Villa",
      status: 1,
      position: 1,
      icon: null,
    }),
  );
  const apartmentCategoryId = await ensureByName(
    await categoryRepository.findAll(),
    "Apartment",
    () =>
      categoryRepository.create({
        name: "Apartment",
        status: 1,
        position: 2,
        icon: null,
      }),
  );
  const landCategoryId = await ensureByName(
    await categoryRepository.findAll(),
    "Land",
    () =>
      categoryRepository.create({
        name: "Land",
        status: 1,
        position: 3,
        icon: null,
      }),
  );

  const products = [
    {
      name: "Sea View Villa Yenisehir",
      description:
        "Spacious 4-bedroom villa with private pool, garden, and panoramic Mediterranean sea views in Yenisehir.",
      price: 425000,
      category_id: villaCategoryId,
      purpose_id: salePurposeId,
      discount_type: "percentage" as const,
      discount_value: 10,
      is_hot_deal: 1 as const,
      is_featured: 1 as const,
      position: 1,
    },
    {
      name: "Modern Villa Mezitli",
      description:
        "Contemporary villa with open living spaces, smart home features, and a landscaped courtyard near Mezitli beach.",
      price: 389000,
      category_id: villaCategoryId,
      purpose_id: salePurposeId,
      discount_type: null,
      discount_value: 0,
      is_hot_deal: 0 as const,
      is_featured: 1 as const,
      position: 2,
    },
    {
      name: "Family Villa Toroslar",
      description:
        "Quiet family villa with three bedrooms, barbecue area, and easy access to schools and markets in Toroslar.",
      price: 2750,
      category_id: villaCategoryId,
      purpose_id: rentPurposeId,
      discount_type: "fixed" as const,
      discount_value: 250,
      is_hot_deal: 1 as const,
      is_featured: 0 as const,
      position: 3,
    },
    {
      name: "City Center Apartment",
      description:
        "Bright 2-bedroom apartment in central Mersin with balcony, fitted kitchen, and walking distance to cafes.",
      price: 165000,
      category_id: apartmentCategoryId,
      purpose_id: salePurposeId,
      discount_type: "percentage" as const,
      discount_value: 8,
      is_hot_deal: 1 as const,
      is_featured: 1 as const,
      position: 4,
    },
    {
      name: "Coastal Studio Apartment",
      description:
        "Furnished studio apartment ideal for investors, minutes from the coastline and public transport.",
      price: 950,
      category_id: apartmentCategoryId,
      purpose_id: rentPurposeId,
      discount_type: null,
      discount_value: 0,
      is_hot_deal: 0 as const,
      is_featured: 0 as const,
      position: 5,
    },
    {
      name: "Investment Land Erdemli",
      description:
        "Zoning-ready land parcel in Erdemli with road access, suitable for residential development.",
      price: 98000,
      category_id: landCategoryId,
      purpose_id: salePurposeId,
      discount_type: null,
      discount_value: 0,
      is_hot_deal: 0 as const,
      is_featured: 1 as const,
      position: 6,
    },
    {
      name: "Hillside Plot Silifke",
      description:
        "Elevated plot with open valley views near Silifke, suitable for a private villa project.",
      price: 72000,
      category_id: landCategoryId,
      purpose_id: salePurposeId,
      discount_type: "percentage" as const,
      discount_value: 5,
      is_hot_deal: 1 as const,
      is_featured: 0 as const,
      position: 7,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (let index = 0; index < products.length; index += 1) {
    const item = products[index];
    if (await productExists(item.name)) {
      skipped += 1;
      continue;
    }

    const productId = await productRepository.create({
      name: item.name,
      image: COVER_IMAGES[index % COVER_IMAGES.length],
      position: item.position,
      description: item.description,
      price: item.price,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      category_id: item.category_id,
      purpose_id: item.purpose_id,
      city_id: cityId,
      status: 1,
      is_hot_deal: item.is_hot_deal,
      is_featured: item.is_featured,
    });

    await productImageRepository.create({
      product_id: productId,
      image: GALLERY_IMAGES[index % GALLERY_IMAGES.length],
      status: 1,
    });

    created += 1;
  }

  console.log("Demo seed complete.");
  console.log(`Categories: Villa, Apartment, Land`);
  console.log(`City: Mersin (Turkey)`);
  console.log(`Purposes: Sale, Rent`);
  console.log(`Products created: ${created}, skipped (already exist): ${skipped}`);

  await closePool();
  process.exit(0);
}

seedDemo().catch(async (error) => {
  console.error("Failed to seed demo data:", error);
  await closePool();
  process.exit(1);
});
