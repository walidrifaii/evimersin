import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { announcementService } from "@/server/services/announcement.service";
import {
  getFirebasePublicConfig,
  isFirebaseAdminConfigured,
  isFirebaseClientConfigured,
} from "@/server/services/firebase.service";
import { ok } from "@/server/utils/response";
import { registerGuestFcmTokenSchema } from "@/server/validators/notification.validator";

export const runtime = "nodejs";

export const GET = compose(withHandler)(async () =>
  ok({
    enabled: isFirebaseClientConfigured(),
    adminReady: isFirebaseAdminConfigured(),
    config: getFirebasePublicConfig(),
    vapidKey: isFirebaseClientConfigured()
      ? (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? null)
      : null,
  }),
);

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
