import { revalidatePath, revalidateTag } from "next/cache";

/** Immediately expire public listing caches after dashboard mutations. */
export function revalidateListingsCache(productId?: number) {
  revalidateTag("property-listings", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/products");
  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

export function revalidateSettingsCache() {
  revalidateTag("site-settings", { expire: 0 });
  revalidatePath("/", "layout");
}
