import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { contactService } from "@/server/services/contact.service";
import { ok } from "@/server/utils/response";
import { contactMessageSchema } from "@/server/validators/contact.validator";

export const runtime = "nodejs";

export const POST = compose(withHandler)(async (request) => {
  const input = validateBody(contactMessageSchema, await parseJsonBody(request));
  await contactService.sendMessage(input);

  return ok({ message: "Your message has been sent successfully." }, 201);
});
