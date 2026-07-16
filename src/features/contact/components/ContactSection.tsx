import { ContactForm } from "@/features/contact/components/ContactForm";
import { ContactInfo } from "@/features/contact/components/ContactInfo";

export function ContactSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
    </section>
  );
}
