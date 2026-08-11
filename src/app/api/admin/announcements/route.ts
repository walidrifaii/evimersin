import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
  withPermission,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { announcementService } from "@/server/services/announcement.service";
import {
  getFirebaseVapidKey,
  isFirebaseAdminConfigured,
  isFirebaseClientConfigured,
} from "@/server/services/firebase.service";
import { ok } from "@/server/utils/response";
import { createAnnouncementSchema } from "@/server/validators/announcement.validator";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 10;

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.ANNOUNCEMENTS_READ),
  withHandler,
)(async (request) => {
  const { searchParams } = new URL(request.url);

  const [page, activeGuestCount, reachableGuestCount] = await Promise.all([
    announcementService.listPage(
      Number(searchParams.get("page") ?? 1),
      Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE),
    ),
    announcementService.getActiveGuestCount(),
    announcementService.getReachableGuestCount(),
  ]);

  return ok({
    activeGuestCount,
    reachableGuestCount,
    firebaseEnabled: isFirebaseClientConfigured() && isFirebaseAdminConfigured(),
    firebaseVapidError: getFirebaseVapidKey().error,
    announcements: page.items.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      isActive: item.is_active === 1,
      createdAt: item.created_at,
    })),
    pagination: {
      page: page.page,
      pageSize: page.pageSize,
      total: page.total,
      totalPages: page.totalPages,
    },
  });
});

export const POST = compose(
  withAuth,
  withPermission(PERMISSIONS.ANNOUNCEMENTS_WRITE),
  withHandler,
)(async (request, context) => {
  const adminId = context.admin?.sub;
  if (!adminId) throw new Error("Unauthorized");

  const input = validateBody(
    createAnnouncementSchema,
    await parseJsonBody(request),
  );

  const result = await announcementService.send({
    title: input.title,
    message: input.message,
    adminId,
  });

  const deliveryNote =
    result.reachableGuestCount === 0
      ? "No guests with notifications enabled are online right now."
      : result.notificationsSent > 0
        ? `Firebase push delivered to ${result.notificationsSent} guest${result.notificationsSent === 1 ? "" : "s"}.`
        : "Announcement saved, but Firebase could not deliver it.";

  return ok(
    {
      ...result,
      message: deliveryNote,
    },
    201,
  );
});
