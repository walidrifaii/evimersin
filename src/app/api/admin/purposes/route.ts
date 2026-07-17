import { purposeService } from "@/server/services/lookup.service";
import { createCollectionHandlers } from "@/server/utils/crud-route";
import { createPurposeSchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

export const { GET, POST } = createCollectionHandlers(
  purposeService,
  createPurposeSchema,
);
