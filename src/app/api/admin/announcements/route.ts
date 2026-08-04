import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
} from "@/server/middleware";
import { announcementService } from "@/server/services/announcement.service";
import { ok } from "@/server/utils/response";
import { createAnnouncementSchema } from "@/server/validators/announcement.validator";

export const runtime = "nodejs";

export const GET = compose(withAuth, withHandler)(async () => {
  const [announcements, activeGuestCount] = await Promise.all([
    announcementService.listRecent(),
    announcementService.getActiveGuestCount(),
  ]);

  return ok({
    activeGuestCount,
    announcements: announcements.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      isActive: item.is_active === 1,
      createdAt: item.created_at,
    })),
  });
});

export const POST = compose(withAuth, withHandler)(async (request, context) => {
  const adminId = context.admin?.sub;
  if (!adminId) throw new Error("Unauthorized");

  const input = validateBody(
    createAnnouncementSchema,
    await parseJsonBody(request),
  );

  const id = await announcementService.send({
    title: input.title,
    message: input.message,
    adminId,
  });

  const activeGuestCount = await announcementService.getActiveGuestCount();

  return ok(
    {
      id,
      activeGuestCount,
      message: "Announcement sent to guests currently on the website.",
    },
    201,
  );
});
