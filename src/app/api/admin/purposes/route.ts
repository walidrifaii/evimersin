import { revalidatePath, revalidateTag } from "next/cache";
import { purposeService } from "@/server/services/lookup.service";
import { createCollectionHandlers } from "@/server/utils/crud-route";
import { createPurposeSchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

function revalidatePublicFilters() {
  revalidateTag("property-listings", "max");
  revalidatePath("/");
  revalidatePath("/products");
}

export const { GET, POST } = createCollectionHandlers(
  purposeService,
  createPurposeSchema,
  { onMutate: revalidatePublicFilters },
);
