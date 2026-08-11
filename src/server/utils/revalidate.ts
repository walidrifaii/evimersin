import { revalidatePath, revalidateTag } from "next/cache";

/** Immediately expire public listing caches after dashboard mutations. */
export function revalidateListingsCache(productId?: number) {
  revalidateTag("property-listings", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/properties");
  if (productId) {
    revalidatePath(`/properties/${productId}`);
  }
}

export function revalidateSettingsCache() {
  revalidateTag("site-settings", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/contact", "page");
  revalidatePath("/[locale]", "layout");
}

export function revalidateHeroSlidesCache() {
  revalidateTag("hero-slides", { expire: 0 });
  revalidatePath("/", "layout");
}
