import { execute, query } from "@/server/database/connection";
import type {
  CreateProductImageInput,
  CreateProductInput,
  Product,
  ProductDetail,
  ProductImage,
  UpdateProductInput,
} from "@/server/types/product.types";
import { withProductPricing } from "@/server/types/product.types";

const productSelect = `
  products.id,
  products.name,
  products.image,
  products.position,
  products.description,
  products.price,
  products.discount_type,
  products.discount_value,
  products.category_id,
  products.purpose_id,
  products.city_id,
  categories.name AS category_name,
  purpose.name AS purpose_name,
  cities.name AS city_name,
  products.status,
  products.is_hot_deal,
  products.is_featured,
  products.date_created
`;

const productFrom = `
  FROM products
  INNER JOIN categories ON categories.id = products.category_id
  INNER JOIN purpose ON purpose.id = products.purpose_id
  INNER JOIN cities ON cities.id = products.city_id
`;

async function updateProductRecord(id: number, input: UpdateProductInput) {
  const fields: string[] = [];
  const params: Record<string, string | number | null> = { id };

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] = value;
    }
  }

  if (fields.length === 0) return false;
  const result = await execute(
    `UPDATE products SET ${fields.join(", ")} WHERE id = :id`,
    params,
  );
  return result.affectedRows > 0;
}

export const productRepository = {
  findAll: async () => {
    const rows = await query<
      Array<
        Omit<Product, "final_price"> & {
          discount_type: Product["discount_type"];
        }
      >
    >(
      `SELECT ${productSelect}
       ${productFrom}
       ORDER BY products.position ASC, products.id DESC`,
    );
    return rows.map((row) => withProductPricing(row));
  },

  findActive: async () => {
    const rows = await query<Array<Omit<Product, "final_price">>>(
      `SELECT ${productSelect}
       ${productFrom}
       WHERE products.status = 1
       ORDER BY products.position ASC, products.id DESC`,
    );
    return rows.map((row) => withProductPricing(row));
  },

  findFeatured: async (limit = 4) => {
    const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
    const rows = await query<Array<Omit<Product, "final_price">>>(
      `SELECT ${productSelect}
       ${productFrom}
       WHERE products.status = 1 AND products.is_featured = 1
       ORDER BY products.position ASC, products.id DESC
       LIMIT ${safeLimit}`,
    );
    return rows.map((row) => withProductPricing(row));
  },

  findHotDeals: async (limit = 4) => {
    const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
    const rows = await query<Array<Omit<Product, "final_price">>>(
      `SELECT ${productSelect}
       ${productFrom}
       WHERE products.status = 1
         AND (
           products.is_hot_deal = 1
           OR (
             products.discount_type IS NOT NULL
             AND products.discount_value > 0
           )
         )
       ORDER BY products.position ASC, products.id DESC
       LIMIT ${safeLimit}`,
    );
    return rows.map((row) => withProductPricing(row));
  },

  async findById(id: number) {
    const rows = await query<
      Array<Omit<Product, "final_price">>
    >(
      `SELECT ${productSelect}
       ${productFrom}
       WHERE products.id = :id
       LIMIT 1`,
      { id },
    );
    const product = rows[0];
    return product ? withProductPricing(product) : null;
  },

  async findDetailById(id: number): Promise<ProductDetail | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const images = await productImageRepository.findByProductId(id);
    return { ...product, images };
  },

  async findDetailsByProducts(products: Product[]): Promise<ProductDetail[]> {
    if (products.length === 0) return [];

    const images = await productImageRepository.findByProductIds(
      products.map((product) => product.id),
    );

    const imagesByProductId = new Map<number, ProductImage[]>();
    for (const image of images) {
      const list = imagesByProductId.get(image.product_id) ?? [];
      list.push(image);
      imagesByProductId.set(image.product_id, list);
    }

    return products.map((product) => ({
      ...product,
      images: imagesByProductId.get(product.id) ?? [],
    }));
  },

  async findActiveDetails(): Promise<ProductDetail[]> {
    const products = await this.findActive();
    return this.findDetailsByProducts(products);
  },

  async findFeaturedDetails(limit = 4): Promise<ProductDetail[]> {
    const products = await this.findFeatured(limit);
    return this.findDetailsByProducts(products);
  },

  async findHotDealDetails(limit = 4): Promise<ProductDetail[]> {
    const products = await this.findHotDeals(limit);
    return this.findDetailsByProducts(products);
  },

  async create(input: CreateProductInput) {
    const result = await execute(
      `INSERT INTO products
        (name, image, position, description, price, discount_type, discount_value, category_id, purpose_id, city_id, status, is_hot_deal, is_featured, date_created)
       VALUES
        (:name, :image, :position, :description, :price, :discount_type, :discount_value, :category_id, :purpose_id, :city_id, :status, :is_hot_deal, :is_featured, CURRENT_DATE())`,
      {
        name: input.name,
        image: input.image ?? null,
        position: input.position ?? 0,
        description: input.description ?? null,
        price: input.price,
        discount_type: input.discount_type ?? null,
        discount_value: input.discount_value ?? 0,
        category_id: input.category_id,
        purpose_id: input.purpose_id,
        city_id: input.city_id,
        status: input.status ?? 1,
        is_hot_deal: input.is_hot_deal ?? 0,
        is_featured: input.is_featured ?? 0,
      },
    );
    return result.insertId;
  },

  update: (id: number, input: UpdateProductInput) =>
    updateProductRecord(id, input),

  delete: async (id: number) => {
    const result = await execute(`DELETE FROM products WHERE id = :id`, { id });
    return result.affectedRows > 0;
  },
};

export const productImageRepository = {
  findByProductId: (productId: number) =>
    query<ProductImage[]>(
      `SELECT id, product_id, image, status
       FROM product_images
       WHERE product_id = :productId
       ORDER BY id ASC`,
      { productId },
    ),

  findByProductIds: async (productIds: number[]) => {
    if (productIds.length === 0) return [];

    const placeholders = productIds.map((_, index) => `:id${index}`).join(", ");
    const params = Object.fromEntries(
      productIds.map((id, index) => [`id${index}`, id]),
    );

    return query<ProductImage[]>(
      `SELECT id, product_id, image, status
       FROM product_images
       WHERE product_id IN (${placeholders})
       ORDER BY id ASC`,
      params,
    );
  },

  async findById(id: number) {
    const rows = await query<ProductImage[]>(
      `SELECT id, product_id, image, status
       FROM product_images
       WHERE id = :id
       LIMIT 1`,
      { id },
    );
    return rows[0] ?? null;
  },

  async create(input: CreateProductImageInput) {
    const result = await execute(
      `INSERT INTO product_images (product_id, image, status)
       VALUES (:product_id, :image, :status)`,
      {
        product_id: input.product_id,
        image: input.image,
        status: input.status ?? 1,
      },
    );
    return result.insertId;
  },

  delete: async (id: number) => {
    const result = await execute(`DELETE FROM product_images WHERE id = :id`, {
      id,
    });
    return result.affectedRows > 0;
  },
};
