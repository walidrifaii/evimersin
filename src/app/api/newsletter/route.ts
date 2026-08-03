import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { newsletterService } from "@/server/services/newsletter.service";
import { ok } from "@/server/utils/response";
import { newsletterSubscribeSchema } from "@/server/validators/newsletter.validator";

export const runtime = "nodejs";

export const POST = compose(withHandler)(async (request) => {
  const input = validateBody(
    newsletterSubscribeSchema,
    await parseJsonBody(request),
  );

  await newsletterService.subscribe({
    email: input.email,
    name: input.name || null,
    locale: input.locale,
  });

  return ok({ message: "Subscribed successfully." }, 201);
});
