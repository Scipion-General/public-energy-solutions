import "server-only";
import nodemailer from "nodemailer";
import type { ContactInput } from "./validation";

export const DEFAULT_CONTACT_TO = "contact@public-energy-solutions.com";

export class MailerConfigError extends Error {}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new MailerConfigError(`Missing environment variable ${name}`);
  return v;
}

/** Send the contact message via SMTP. All credentials come from env vars. */
export async function sendContactEmail(data: ContactInput): Promise<void> {
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASSWORD") },
  });

  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Organisation: ${data.organisation || "-"}`,
    `Organisation type: ${data.organisationType || "-"}`,
    "",
    data.message,
  ].join("\n");

  await transport.sendMail({
    from: requireEnv("CONTACT_FROM_EMAIL"),
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_TO,
    replyTo: { name: data.name, address: data.email },
    subject: `[PES website] ${data.subject}`,
    text,
  });
}
