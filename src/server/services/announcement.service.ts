import {
  announcementRepository,
  guestSessionRepository,
} from "@/server/database/repositories/announcement.repository";
import type { UpsertGuestSessionInput } from "@/server/types/announcement.types";

export const announcementService = {
  getActiveAnnouncement: async () => {
    const rows = await announcementRepository.findActive();
    return rows[0] ?? null;
  },

  listRecent: (limit = 20) => announcementRepository.findRecent(limit),

  send: (input: { title: string; message: string; adminId: number }) =>
    announcementRepository.create({
      title: input.title,
      message: input.message,
      created_by: input.adminId,
    }),

  getActiveGuestCount: (withinMinutes = 5) =>
    guestSessionRepository.countActive(withinMinutes),

  getActiveGuests: (withinMinutes = 5, limit = 50) =>
    guestSessionRepository.findActive(withinMinutes, limit),

  updatePresence: (input: UpsertGuestSessionInput) =>
    guestSessionRepository.upsert(input),
};
