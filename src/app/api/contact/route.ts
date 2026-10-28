import { NextResponse } from "next/server";
import { validateContact } from "@/lib/contact/validation";
import { MailerConfigError, MailerSendError, sendContactEmail } from "@/lib/contact/mailer";
import { site } from "@/content/site";

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, message: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  // Honeypot filled: pretend success, send nothing.
  if (result.isSpam) return NextResponse.json({ ok: true });

  try {
    await sendContactEmail(result.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Detailed cause goes to the server log only (never to the browser).
    const kind = e instanceof MailerConfigError ? "configuration" : e instanceof MailerSendError ? "provider" : "unexpected";
    console.error(`[contact] send failed (${kind} error):`, e instanceof Error ? e.message : e);
    return NextResponse.json(
      {
        ok: false,
        message: `Your message could not be sent. Please try again later or email us directly at ${site.contactEmail}.`,
        fallbackEmail: site.contactEmail,
      },
      { status: kind === "configuration" ? 503 : 502 },
    );
  }
}
