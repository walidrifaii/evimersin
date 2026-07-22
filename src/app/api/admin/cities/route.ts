import { revalidatePath, revalidateTag } from "next/cache";
import { cityService } from "@/server/services/lookup.service";
import { createCollectionHandlers } from "@/server/utils/crud-route";
import { createCitySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

function revalidatePublicFilters() {
  revalidateTag("property-listings", "max");
  revalidatePath("/");
  revalidatePath("/products");
}

export const { GET, POST } = createCollectionHandlers(
  cityService,
  createCitySchema,
  { onMutate: revalidatePublicFilters },
);
