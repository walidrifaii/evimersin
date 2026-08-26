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
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Public Firebase web config — env only, safe to cache. */
export const GET = compose(withHandler)(async () => {
  const vapid = getFirebaseVapidKey();

  const body = {
    success: true as const,
    data: {
      enabled: isFirebaseClientConfigured(),
      adminReady: isFirebaseAdminConfigured(),
      config: getFirebasePublicConfig(),
      vapidKey: vapid.valid ? vapid.key : null,
      vapidKeyError: vapid.error,
    },
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
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
