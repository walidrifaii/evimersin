import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { announcementService } from "@/server/services/announcement.service";
import {
  getFirebasePublicConfig,
  getFirebaseVapidKey,
  isFirebaseAdminConfigured,
  isFirebaseClientConfigured,
} from "@/server/services/firebase.service";
import { ok } from "@/server/utils/response";
import { registerGuestFcmTokenSchema } from "@/server/validators/notification.validator";

export const runtime = "nodejs";

export const GET = compose(withHandler)(async () => {
  const vapid = getFirebaseVapidKey();

  return ok({
    enabled: isFirebaseClientConfigured(),
    adminReady: isFirebaseAdminConfigured(),
    config: getFirebasePublicConfig(),
    vapidKey: vapid.valid ? vapid.key : null,
    vapidKeyError: vapid.error,
  });
});

export const POST = compose(withHandler)(async (request) => {
  const input = validateBody(
    registerGuestFcmTokenSchema,
    await parseJsonBody(request),
  );

  await announcementService.registerGuestToken({
    session_id: input.sessionId,
    token: input.token,
    locale: input.locale,
  });

  return ok({ message: "Guest notification token saved." }, 201);
});
