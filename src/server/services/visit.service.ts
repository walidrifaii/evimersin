import { siteVisitRepository } from "@/server/database/repositories/notification.repository";
import type { CreateSiteVisitInput } from "@/server/types/notification.types";

export const visitService = {
  async trackVisit(input: CreateSiteVisitInput) {
    const visitId = await siteVisitRepository.create(input);
    return { id: visitId };
  },
};
