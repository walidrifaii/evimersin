import { countryService } from "@/server/services/lookup.service";
import { createCollectionHandlers } from "@/server/utils/crud-route";
import { createCountrySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, POST } = createCollectionHandlers(
  countryService,
  createCountrySchema,
);
