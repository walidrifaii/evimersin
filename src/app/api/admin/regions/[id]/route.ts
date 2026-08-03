import { regionService } from "@/server/services/lookup.service";
import { createItemHandlers } from "@/server/utils/crud-route";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { updateRegionSchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, PUT, DELETE } = createItemHandlers(
  "Region",
  regionService,
  updateRegionSchema,
  { onMutate: () => revalidateListingsCache() },
);
