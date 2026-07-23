import fs from "fs";
import path from "path";
import { closePool, execute, query } from "@/server/database/connection";
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

const COVER_IMAGES = [
  "/uploads/products/16e546d2-9ea3-4ed3-bc35-5a8f0bc49ee8.jpg",
  "/uploads/products/8fa18561-17a3-42b6-81b3-c47f6e423104.jpg",
  "/uploads/products/b7b4cf8d-c191-415a-9c80-df9a499af660.png",
];

const GALLERY_IMAGES = [
  "/uploads/products/gallery/47b60825-a870-40d7-8d03-b89042caacec.jpg",
  "/uploads/products/gallery/502d5caf-ed8d-4417-bcfe-30c16db440fd.jpg",
  "/uploads/products/gallery/9861e57f-48ab-4e05-bfe0-919a2ea44316.jpg",
  "/uploads/products/gallery/33be350f-d3ec-4198-9b58-45e4b4d40a1f.jpg",
  "/uploads/products/gallery/7d5103a1-0d47-493e-aa22-aba91fc5d108.jpg",
  "/uploads/products/gallery/a699c783-40a5-4c32-a139-760fa28cd614.jpg",
];

function assertImagesExist() {
  const missing = [...COVER_IMAGES, ...GALLERY_IMAGES].filter((imagePath) => {
    const absolute = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
    return !fs.existsSync(absolute);
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing seed images:\n${missing.map((item) => ` - ${item}`).join("\n")}`,
    );
  }
}

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

async function renamePurposeIfNeeded(fromNames: string[], toName: string) {
  for (const fromName of fromNames) {
    await execute(
      `UPDATE purpose
       SET name = :toName, status = 1
       WHERE LOWER(name) = LOWER(:fromName)`,
      { fromName, toName },
    );
  }
}

async function resetProducts() {
  await execute("DELETE FROM product_images");
  await execute("DELETE FROM products");
}

async function seedDemo() {
  loadEnv();
  await setupDatabase();
  assertImagesExist();

  console.log("Resetting products...");
  await resetProducts();

  // Prefer Turkey for EviMersin; keep/create a clean country row.
  let turkey = (await countryRepository.findAll()).find(
    (item) => item.name.toLowerCase() === "turkey",
  );
  if (!turkey) {
    const id = await countryRepository.create({ name: "Turkey", status: 1 });
    turkey = { id, name: "Turkey", status: 1 };
  } else if (turkey.status !== 1) {
    await countryRepository.update(turkey.id, { status: 1 });
  }

  const cityNames = ["Mersin", "Tarsus", "Erdemli", "Silifke", "Anamur", "Mut"];
  const cityIds: Record<string, number> = {};
  for (const cityName of cityNames) {
    const cities = await cityRepository.findAll();
    cityIds[cityName] = await ensureByName(cities, cityName, () =>
      cityRepository.create({
        name: cityName,
        country_id: turkey!.id,
        status: 1,
      }),
    );
    await execute(
      `UPDATE cities
       SET country_id = :countryId, status = 1, name = :name
       WHERE id = :id`,
      { countryId: turkey.id, name: cityName, id: cityIds[cityName] },
    );
  }

  // Hide leftover cities (e.g. Beirut) from filters so search options stay clean.
  await execute(
    `UPDATE cities
     SET status = 0
     WHERE LOWER(name) NOT IN (${cityNames.map((_, i) => `:c${i}`).join(", ")})`,
    Object.fromEntries(cityNames.map((name, i) => [`c${i}`, name.toLowerCase()])),
  );

  // Normalize purpose labels so UI filters match DB values.
  await renamePurposeIfNeeded(["Sale", "For sale", "Buy"], "For Sale");
  await renamePurposeIfNeeded(["Rent", "For rent", "Rental"], "For Rent");

  const purposes = await purposeRepository.findAll();
  const salePurposeId = await ensureByName(purposes, "For Sale", () =>
    purposeRepository.create({ name: "For Sale", status: 1, position: 1 }),
  );
  const rentPurposeId = await ensureByName(
    await purposeRepository.findAll(),
    "For Rent",
    () => purposeRepository.create({ name: "For Rent", status: 1, position: 2 }),
  );

  await execute(
    `UPDATE purpose SET status = 1 WHERE id IN (:saleId, :rentId)`,
    { saleId: salePurposeId, rentId: rentPurposeId },
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

  await execute(
    `UPDATE categories SET status = 1 WHERE id IN (:villaId, :apartmentId, :landId)`,
    {
      villaId: villaCategoryId,
      apartmentId: apartmentCategoryId,
      landId: landCategoryId,
    },
  );

  const products = [
    {
      name: "Sea View Villa Yenisehir",
      description:
        "Spacious 4-bedroom villa with private pool, garden, and panoramic Mediterranean sea views in Yenisehir.",
      price: 425000,
      category_id: villaCategoryId,
      purpose_id: salePurposeId,
      city: "Mersin",
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
      city: "Mersin",
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
      city: "Mersin",
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
      city: "Mersin",
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
      city: "Erdemli",
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
      city: "Erdemli",
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
      city: "Silifke",
      discount_type: "percentage" as const,
      discount_value: 5,
      is_hot_deal: 1 as const,
      is_featured: 0 as const,
      position: 7,
    },
    {
      name: "Tarsus Garden Apartment",
      description:
        "Family apartment with garden access in Tarsus, close to markets and major roads.",
      price: 142000,
      category_id: apartmentCategoryId,
      purpose_id: salePurposeId,
      city: "Tarsus",
      discount_type: null,
      discount_value: 0,
      is_hot_deal: 0 as const,
      is_featured: 0 as const,
      position: 8,
    },
  ];

  let created = 0;

  for (let index = 0; index < products.length; index += 1) {
    const item = products[index];
    const cityId = cityIds[item.city];
    if (!cityId) {
      throw new Error(`Missing city id for ${item.city}`);
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
    await productImageRepository.create({
      product_id: productId,
      image: GALLERY_IMAGES[(index + 1) % GALLERY_IMAGES.length],
      status: 1,
    });

    created += 1;
  }

  const summary = await query<
    Array<{
      id: number;
      name: string;
      city: string;
      category: string;
      purpose: string;
      image: string | null;
    }>
  >(
    `SELECT products.id, products.name, cities.name AS city,
            categories.name AS category, purpose.name AS purpose, products.image
     FROM products
     INNER JOIN cities ON cities.id = products.city_id
     INNER JOIN categories ON categories.id = products.category_id
     INNER JOIN purpose ON purpose.id = products.purpose_id
     ORDER BY products.position ASC`,
  );

  console.log("Demo seed complete.");
  console.log(`Country: Turkey`);
  console.log(`Cities: ${cityNames.join(", ")}`);
  console.log(`Purposes: For Sale, For Rent`);
  console.log(`Categories: Villa, Apartment, Land`);
  console.log(`Products created: ${created}`);
  console.log("Listings:");
  for (const row of summary) {
    console.log(
      ` - #${row.id} ${row.name} | ${row.city} | ${row.category} | ${row.purpose} | ${row.image}`,
    );
  }

  await closePool();
  process.exit(0);
}

seedDemo().catch(async (error) => {
  console.error("Failed to seed demo data:", error);
  await closePool();
  process.exit(1);
});
