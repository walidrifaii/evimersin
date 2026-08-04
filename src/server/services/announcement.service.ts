import {
  announcementRepository,
  guestSessionRepository,
} from "@/server/database/repositories/announcement.repository";
import { guestFcmTokenRepository } from "@/server/database/repositories/notification.repository";
import { firebaseService } from "@/server/services/firebase.service";
import { guestPresenceHub } from "@/server/services/guest-presence-hub";
import type { UpsertGuestSessionInput } from "@/server/types/announcement.types";
import type { RegisterGuestFcmTokenInput } from "@/server/types/notification.types";

guestPresenceHub.configure(async () => ({
  activeGuestCount: await guestSessionRepository.countActive(),
  reachableGuestCount: await guestFcmTokenRepository.countReachable(),
}));

export const announcementService = {
  listRecent: (limit = 20) => announcementRepository.findRecent(limit),

  getLiveCounts: async () => ({
    activeGuestCount: await guestSessionRepository.countActive(),
    reachableGuestCount: await guestFcmTokenRepository.countReachable(),
  }),

  getActiveGuestCount: () => guestSessionRepository.countActive(),

  getReachableGuestCount: () => guestFcmTokenRepository.countReachable(),

  async updatePresence(input: UpsertGuestSessionInput) {
    await guestSessionRepository.upsert(input);
    void guestPresenceHub.notifyChange();
  },

  async removePresence(sessionId: string) {
    await guestSessionRepository.remove(sessionId);
    void guestPresenceHub.notifyChange({ immediate: true });
  },

  async registerGuestToken(input: RegisterGuestFcmTokenInput) {
    await guestFcmTokenRepository.upsert(input);
    void guestPresenceHub.notifyChange({ immediate: true });
  },

  async send(input: { title: string; message: string; adminId: number }) {
    const id = await announcementRepository.create({
      title: input.title,
      message: input.message,
      created_by: input.adminId,
    });

    const [activeGuestCount, reachableGuestCount, tokenRows] = await Promise.all([
      guestSessionRepository.countActive(),
      guestFcmTokenRepository.countReachable(),
      guestFcmTokenRepository.findActiveTokens(),
    ]);

    const tokens = tokenRows.map((row) => row.token).filter(Boolean);
    let notificationsSent = 0;
    let notificationsFailed = 0;

    if (tokens.length > 0 && firebaseService.isReady()) {
      try {
        const result = await firebaseService.sendAnnouncementNotification({
          announcementId: id,
          title: input.title,
          message: input.message,
          tokens,
        });

        notificationsSent = result.sent;
        notificationsFailed = result.failed;

        if (result.invalidTokens.length > 0) {
          await guestFcmTokenRepository.deleteByTokens(result.invalidTokens);
        }
      } catch (error) {
        console.error("[announcements] Failed to send Firebase notification:", error);
        notificationsFailed = tokens.length;
      }
    }

    return {
      id,
      activeGuestCount,
      reachableGuestCount,
      notificationsSent,
      notificationsFailed,
    };
  },
};
