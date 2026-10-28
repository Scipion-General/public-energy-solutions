#!/usr/bin/env node
/**
 * Check the contact-form email configuration and send one test email.
 *
 *   npm run mail:test                 # reads .env.local
 *   npm run mail:test -- --verify     # only check the SMTP login, send nothing
 *
 * Prints the cause of failure (missing variable, login refused, port blocked...).
 */
import nodemailer from "nodemailer";

const env = (n) => process.env[n]?.trim() || undefined;
const verifyOnly = process.argv.includes("--verify");
const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};

const provider = env("MAIL_PROVIDER")?.toLowerCase() ?? (env("RESEND_API_KEY") ? "resend" : "smtp");
const from = env("CONTACT_FROM_EMAIL");
const to = env("CONTACT_TO_EMAIL") ?? "contact@public-energy-solutions.com";
console.log(`Provider: ${provider}\nFrom:     ${from ?? "(missing)"}\nTo:       ${to}`);
if (!from) fail("CONTACT_FROM_EMAIL is not set.");

const subject = "[PES website] Test email";
const text = "This is a test email sent by `npm run mail:test`. If you received it, the contact form is configured correctly.";

if (provider === "resend") {
  const key = env("RESEND_API_KEY");
  if (!key) fail("RESEND_API_KEY is not set.");
  if (verifyOnly) {
    console.log("\n✓ RESEND_API_KEY is set (use without --verify to send a test email).");
    process.exit(0);
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  }).catch((e) => fail(`Cannot reach the Resend API: ${e.message}`));
  if (!res.ok) fail(`Resend API returned ${res.status}: ${await res.text()}`);
  console.log(`\n✓ Test email accepted by Resend. Check the inbox of ${to}.`);
} else if (provider === "smtp") {
  for (const n of ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"]) if (!env(n)) fail(`${n} is not set.`);
  const port = Number(env("SMTP_PORT") ?? 587);
  const secureRaw = env("SMTP_SECURE")?.toLowerCase();
  const secure = secureRaw ? ["true", "1", "yes"].includes(secureRaw) : port === 465;
  console.log(`SMTP:     ${env("SMTP_HOST")}:${port} (secure=${secure}) as ${env("SMTP_USER")}`);
  const t = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASSWORD") },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  try {
    await t.verify();
    console.log("✓ Connected and logged in.");
    if (!verifyOnly) {
      await t.sendMail({ from, to, subject, text });
      console.log(`✓ Test email sent. Check the inbox (and spam folder) of ${to}.`);
    }
  } catch (e) {
    let hint = "";
    if (e.code === "EAUTH") hint = "\n  Login refused: check SMTP_USER/SMTP_PASSWORD. Gmail requires an app password; Outlook.com/Hotmail no longer allow password SMTP login.";
    else if (["ETIMEDOUT", "ECONNECTION", "ECONNREFUSED", "ESOCKET"].includes(e.code)) hint = "\n  Connection problem: check SMTP_HOST/SMTP_PORT and SMTP_SECURE (587+false or 465+true).";
    else if (e.code === "EENVELOPE") hint = "\n  Address rejected: CONTACT_FROM_EMAIL must be allowed by your SMTP account.";
    fail(`${e.message}${hint}`);
  } finally {
    t.close();
  }
} else {
  fail(`MAIL_PROVIDER must be "resend" or "smtp", got "${provider}".`);
}
