import { compose, withHandler } from "@/server/middleware";
import { announcementService } from "@/server/services/announcement.service";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";

export const GET = compose(withHandler)(async () => {
  const announcement = await announcementService.getActiveAnnouncement();

  if (!announcement) {
    return ok({ announcement: null });
  }

  return ok({
    announcement: {
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      createdAt: announcement.created_at,
    },
  });
});
