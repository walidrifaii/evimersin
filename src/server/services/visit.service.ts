import {
  fcmTokenRepository,
  siteVisitRepository,
} from "@/server/database/repositories/notification.repository";
import { firebaseService } from "@/server/services/firebase.service";
import type { CreateSiteVisitInput } from "@/server/types/notification.types";

export const visitService = {
  async trackVisit(input: CreateSiteVisitInput) {
    const isRepeatSession = await siteVisitRepository.hasRecentSession(
      input.session_id,
    );

    const visitId = await siteVisitRepository.create(input);

    if (!isRepeatSession && firebaseService.isReady()) {
      const tokens = await fcmTokenRepository.findAllTokens();
      const tokenValues = tokens.map((row) => row.token).filter(Boolean);

      if (tokenValues.length > 0) {
        try {
          await firebaseService.sendVisitorNotification({
            path: input.path,
            locale: input.locale ?? "en",
            tokens: tokenValues,
          });
        } catch (error) {
          console.error("[visits] Failed to send Firebase notification:", error);
        }
      }
    }

    return { id: visitId, notified: !isRepeatSession };
  },
};

export const fcmTokenService = {
  listForAdmin: (adminId: number) => fcmTokenRepository.findByAdminId(adminId),

  register: (adminId: number, token: string, deviceLabel?: string | null) =>
    fcmTokenRepository.upsert({
      admin_id: adminId,
      token,
      device_label: deviceLabel ?? null,
    }),

  remove: (token: string) => fcmTokenRepository.deleteByToken(token),
};
