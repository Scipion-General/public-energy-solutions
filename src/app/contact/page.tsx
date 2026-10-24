import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name}.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact us">
        <p>
          Tell us about your organisation and your question. You can also email{" "}
          <a href={`mailto:${site.contactEmail}`} style={{ color: "inherit" }}>
            {site.contactEmail}
          </a>
          .
        </p>
      </PageHeader>
      <div className="container section">
        <ContactForm />
      </div>
    </>
  );
}
