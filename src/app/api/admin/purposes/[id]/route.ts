import { revalidatePath, revalidateTag } from "next/cache";
import { purposeService } from "@/server/services/lookup.service";
import { createItemHandlers } from "@/server/utils/crud-route";
import { updatePurposeSchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

function revalidatePublicFilters() {
  revalidateTag("property-listings", "max");
  revalidatePath("/");
  revalidatePath("/products");
}

export const { GET, PUT, DELETE } = createItemHandlers(
  "Purpose",
  purposeService,
  updatePurposeSchema,
  { onMutate: revalidatePublicFilters },
);
