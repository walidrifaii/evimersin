import { revalidatePath, revalidateTag } from "next/cache";
import { cityService } from "@/server/services/lookup.service";
import { createItemHandlers } from "@/server/utils/crud-route";
import { updateCitySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

function revalidatePublicFilters() {
  revalidateTag("property-listings", "max");
  revalidatePath("/");
  revalidatePath("/products");
}

export const { GET, PUT, DELETE } = createItemHandlers(
  "City",
  cityService,
  updateCitySchema,
  { onMutate: revalidatePublicFilters },
);
