export type NewsletterSubscriber = {
  id: number;
  email: string;
  name: string | null;
  locale: string;
  created_at: string;
};

export type CreateNewsletterSubscriberInput = {
  email: string;
  name?: string | null;
  locale?: string;
};
