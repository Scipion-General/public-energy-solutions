import "server-only";
import nodemailer from "nodemailer";
import type { ContactInput } from "./validation";

export const DEFAULT_CONTACT_TO = "contact@public-energy-solutions.com";

/** Configuration problem: a variable is missing or invalid. */
export class MailerConfigError extends Error {
  name = "MailerConfigError";
}

/** The provider was reached (or tried) but refused / failed. */
export class MailerSendError extends Error {
  name = "MailerSendError";
}

export type MailProvider = "resend" | "smtp";

interface Message {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

const env = (name: string) => process.env[name]?.trim() || undefined;

function requireEnv(name: string): string {
  const v = env(name);
  if (!v) throw new MailerConfigError(`Missing environment variable ${name}`);
  return v;
}

/**
 * Which provider is used:
 * - MAIL_PROVIDER=resend|smtp if set,
 * - otherwise "resend" when RESEND_API_KEY is set, else "smtp".
 */
export function selectProvider(): MailProvider {
  const explicit = env("MAIL_PROVIDER")?.toLowerCase();
  if (explicit === "resend" || explicit === "smtp") return explicit;
  if (explicit) throw new MailerConfigError(`MAIL_PROVIDER must be "resend" or "smtp", got "${explicit}"`);
  return env("RESEND_API_KEY") ? "resend" : "smtp";
}

export function buildMessage(data: ContactInput): Message {
  return {
    from: requireEnv("CONTACT_FROM_EMAIL"),
    to: env("CONTACT_TO_EMAIL") ?? DEFAULT_CONTACT_TO,
    replyTo: `${data.name.replace(/[<>"]/g, "")} <${data.email}>`,
    subject: `[PES website] ${data.subject}`,
    text: [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Organisation: ${data.organisation || "-"}`,
      `Organisation type: ${data.organisationType || "-"}`,
      "",
      data.message,
    ].join("\n"),
  };
}

/** Resend HTTP API (https://resend.com) — no SMTP ports or mailbox password needed. */
async function sendViaResend(msg: Message): Promise<void> {
  const key = requireEnv("RESEND_API_KEY");
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: msg.from, to: [msg.to], reply_to: msg.replyTo, subject: msg.subject, text: msg.text }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    throw new MailerSendError(`Resend API unreachable: ${(e as Error).message}`);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new MailerSendError(`Resend API returned ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export function smtpOptions() {
  const port = Number(env("SMTP_PORT") ?? 587);
  if (!Number.isInteger(port) || port <= 0) throw new MailerConfigError(`SMTP_PORT is not a valid port: "${env("SMTP_PORT")}"`);
  const secureRaw = env("SMTP_SECURE")?.toLowerCase();
  const secure = secureRaw ? ["true", "1", "yes"].includes(secureRaw) : port === 465;
  return {
    host: requireEnv("SMTP_HOST"),
    port,
    secure,
    auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASSWORD") },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
}

/** Turn nodemailer errors into an actionable message for the server log. */
function explainSmtpError(e: unknown): string {
  const err = e as { code?: string; responseCode?: number; message?: string };
  const base = err.message ?? String(e);
  if (err.code === "EAUTH" || err.responseCode === 535)
    return `SMTP login refused (${base}). Check SMTP_USER/SMTP_PASSWORD. Gmail needs an app password; Outlook.com/Hotmail no longer accepts password (basic) SMTP auth — use another provider or MAIL_PROVIDER=resend.`;
  if (err.code === "ETIMEDOUT" || err.code === "ECONNECTION" || err.code === "ECONNREFUSED" || err.code === "ESOCKET")
    return `Cannot connect to SMTP server (${base}). Check SMTP_HOST/SMTP_PORT/SMTP_SECURE (587+false or 465+true); some hosts block outbound SMTP.`;
  if (err.code === "EENVELOPE" || err.responseCode === 550 || err.responseCode === 553)
    return `Sender/recipient rejected (${base}). CONTACT_FROM_EMAIL must be an address your SMTP account is allowed to send from.`;
  return base;
}

async function sendViaSmtp(msg: Message): Promise<void> {
  const transport = nodemailer.createTransport(smtpOptions());
  try {
    await transport.sendMail(msg);
  } catch (e) {
    throw new MailerSendError(explainSmtpError(e));
  } finally {
    transport.close();
  }
}

/** Send the contact message. All credentials come from server-side env vars. */
export async function sendContactEmail(data: ContactInput): Promise<void> {
  const provider = selectProvider();
  const msg = buildMessage(data);
  if (provider === "resend") await sendViaResend(msg);
  else await sendViaSmtp(msg);
}
