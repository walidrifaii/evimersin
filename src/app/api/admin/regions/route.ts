import { regionService } from "@/server/services/lookup.service";
import { createCollectionHandlers } from "@/server/utils/crud-route";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { createRegionSchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, POST } = createCollectionHandlers(
  regionService,
  createRegionSchema,
  { onMutate: () => revalidateListingsCache() },
);
