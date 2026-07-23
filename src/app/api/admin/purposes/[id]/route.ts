import { purposeService } from "@/server/services/lookup.service";
import { createItemHandlers } from "@/server/utils/crud-route";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { updatePurposeSchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, PUT, DELETE } = createItemHandlers(
  "Purpose",
  purposeService,
  updatePurposeSchema,
  { onMutate: () => revalidateListingsCache() },
);
