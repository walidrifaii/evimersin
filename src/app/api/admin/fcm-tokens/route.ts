import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
} from "@/server/middleware";
import { fcmTokenService } from "@/server/services/visit.service";
import {
  getFirebasePublicConfig,
  isFirebaseClientConfigured,
} from "@/server/services/firebase.service";
import { ok } from "@/server/utils/response";
import { AppError } from "@/server/utils/errors";
import { registerFcmTokenSchema } from "@/server/validators/notification.validator";

export const runtime = "nodejs";

export const GET = compose(withAuth, withHandler)(async (_request, context) => {
  const adminId = context.admin?.sub;
  if (!adminId) return ok({ tokens: [], enabled: false });

  const tokens = await fcmTokenService.listForAdmin(adminId);

  return ok({
    enabled: isFirebaseClientConfigured(),
    config: getFirebasePublicConfig(),
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? null,
    tokens: tokens.map((item) => ({
      id: item.id,
      deviceLabel: item.device_label,
      createdAt: item.created_at,
    })),
  });
});

export const POST = compose(withAuth, withHandler)(async (request, context) => {
  const adminId = context.admin?.sub;
  if (!adminId) throw new Error("Unauthorized");

  const input = validateBody(
    registerFcmTokenSchema,
    await parseJsonBody(request),
  );

  await fcmTokenService.register(
    adminId,
    input.token,
    input.deviceLabel || null,
  );

  return ok({ message: "Notification token saved." }, 201);
});

export const DELETE = compose(withAuth, withHandler)(async (request) => {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    throw new AppError("Token query param is required.", 400);
  }

  await fcmTokenService.remove(token);
  return ok({ message: "Notification token removed." });
});
