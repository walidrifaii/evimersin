import { cityService } from "@/server/services/lookup.service";
import { createItemHandlers } from "@/server/utils/crud-route";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { updateCitySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, PUT, DELETE } = createItemHandlers(
  "City",
  cityService,
  updateCitySchema,
  { onMutate: () => revalidateListingsCache() },
);
