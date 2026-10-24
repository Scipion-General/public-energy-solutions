/** Shared (client + server) validation for the contact form. */

export const CONTACT_LIMITS = {
  name: 100,
  organisation: 150,
  email: 254,
  subject: 150,
  message: 5000,
  messageMin: 10,
} as const;

export const ORGANISATION_TYPES = [
  "Public sector body",
  "Company",
  "Other",
] as const;

export interface ContactInput {
  name: string;
  email: string;
  organisation: string;
  organisationType: string;
  subject: string;
  message: string;
  consent: boolean;
  /** Honeypot: must be empty. Hidden from humans. */
  website: string;
}

export type ContactField = Exclude<keyof ContactInput, "website">;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ValidationResult =
  | { ok: true; data: ContactInput; isSpam: boolean }
  | { ok: false; errors: ContactErrors };

const EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Strip CR/LF so header-bound values cannot inject extra email headers. */
const singleLine = (v: string) => v.replace(/[\r\n]+/g, " ");

export function validateContact(raw: unknown): ValidationResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const data: ContactInput = {
    name: singleLine(str(r.name)),
    email: singleLine(str(r.email)),
    organisation: singleLine(str(r.organisation)),
    organisationType: str(r.organisationType),
    subject: singleLine(str(r.subject)),
    message: str(r.message),
    consent: r.consent === true || r.consent === "true" || r.consent === "on",
    website: str(r.website),
  };
  const errors: ContactErrors = {};
  const L = CONTACT_LIMITS;

  if (!data.name) errors.name = "Please enter your name.";
  else if (data.name.length > L.name) errors.name = `Name must be at most ${L.name} characters.`;

  if (!data.email) errors.email = "Please enter your email address.";
  else if (data.email.length > L.email || !EMAIL_RE.test(data.email))
    errors.email = "Please enter a valid email address.";

  if (data.organisation.length > L.organisation)
    errors.organisation = `Organisation must be at most ${L.organisation} characters.`;

  if (data.organisationType && !(ORGANISATION_TYPES as readonly string[]).includes(data.organisationType))
    errors.organisationType = "Please choose an option from the list.";

  if (!data.subject) errors.subject = "Please enter a subject.";
  else if (data.subject.length > L.subject)
    errors.subject = `Subject must be at most ${L.subject} characters.`;

  if (!data.message) errors.message = "Please enter a message.";
  else if (data.message.length < L.messageMin)
    errors.message = `Message must be at least ${L.messageMin} characters.`;
  else if (data.message.length > L.message)
    errors.message = `Message must be at most ${L.message} characters.`;

  if (!data.consent) errors.consent = "Please confirm we may use your details to reply.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data, isSpam: data.website !== "" };
}
