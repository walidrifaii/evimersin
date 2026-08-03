import { newsletterRepository } from "@/server/database/repositories/newsletter.repository";
import type { CreateNewsletterSubscriberInput } from "@/server/types/newsletter.types";
import { AppError } from "@/server/utils/errors";

export const newsletterService = {
  async subscribe(input: CreateNewsletterSubscriberInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await newsletterRepository.findByEmail(email);

    if (existing) {
      throw new AppError("This email is already subscribed.", 409);
    }

    const payload = {
      email,
      name: input.name?.trim() || null,
      locale: input.locale ?? "en",
    };

    const id = await newsletterRepository.create(payload);
    const subscriber = await newsletterRepository.findById(id);
    if (!subscriber) {
      throw new AppError("Unable to save subscription.", 500);
    }

    return subscriber;
  },
};
