import { countryService } from "@/server/services/lookup.service";
import { createItemHandlers } from "@/server/utils/crud-route";
import { updateCountrySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, PUT, DELETE } = createItemHandlers(
  "Country",
  countryService,
  updateCountrySchema,
);
