import { mailService, type ContactEmailInput } from "@/server/services/mail.service";

export const contactService = {
  sendMessage(input: ContactEmailInput) {
    return mailService.sendContactNotification(input);
  },
};
