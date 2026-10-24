"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  CONTACT_LIMITS,
  ORGANISATION_TYPES,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/validation";
import { Placeholder } from "./Placeholder";
import styles from "./ContactForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const FIELD_ORDER: ContactField[] = ["name", "email", "organisation", "organisationType", "subject", "message", "consent"];

export function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  function focusFirstError(errs: ContactErrors) {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(fd.entries()), consent: fd.get("consent") === "on" };

    const result = validateContact(payload);
    if (!result.ok) {
      setErrors(result.errors);
      focusFirstError(result.errors);
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setStatus({ kind: "sent" });
        formRef.current?.reset();
      } else if (body.errors) {
        setErrors(body.errors);
        setStatus({ kind: "idle" });
        focusFirstError(body.errors);
      } else {
        setStatus({ kind: "error", message: body.message ?? "Your message could not be sent." });
      }
    } catch {
      setStatus({ kind: "error", message: "Network error: your message could not be sent." });
    }
  }

  const errorCount = Object.keys(errors).length;
  const describedBy = (f: ContactField, hint?: string) =>
    [hint, errors[f] ? `${f}-error` : undefined].filter(Boolean).join(" ") || undefined;

  const fieldError = (f: ContactField) =>
    errors[f] ? (
      <p id={`${f}-error`} className={styles.error}>
        {errors[f]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form} aria-describedby="required-note">
      <p id="required-note" className={styles.hint}>
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden">with an asterisk</span> are required.
      </p>

      <div role="status" aria-live="polite" className={styles.live}>
        {status.kind === "sent" && (
          <p className={styles.success}>Thank you — your message has been sent. We will reply by email.</p>
        )}
        {status.kind === "sending" && <p>Sending…</p>}
      </div>
      <div role="alert">
        {status.kind === "error" && <p className={styles.failure}>{status.message}</p>}
        {errorCount > 0 && (
          <p className={styles.failure}>
            Please correct {errorCount} {errorCount === 1 ? "field" : "fields"} below.
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name">
            Name <span aria-hidden="true">*</span>
          </label>
          <input id="name" name="name" autoComplete="name" required maxLength={CONTACT_LIMITS.name}
            aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
          {fieldError("name")}
        </div>
        <div className={styles.field}>
          <label htmlFor="email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={CONTACT_LIMITS.email}
            aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
          {fieldError("email")}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="organisation">Organisation</label>
          <input id="organisation" name="organisation" autoComplete="organization" maxLength={CONTACT_LIMITS.organisation}
            aria-invalid={!!errors.organisation} aria-describedby={describedBy("organisation")} />
          {fieldError("organisation")}
        </div>
        <div className={styles.field}>
          <label htmlFor="organisationType">Organisation type</label>
          <select id="organisationType" name="organisationType" defaultValue=""
            aria-invalid={!!errors.organisationType} aria-describedby={describedBy("organisationType")}>
            <option value="">Select…</option>
            {ORGANISATION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {fieldError("organisationType")}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="subject">
          Subject <span aria-hidden="true">*</span>
        </label>
        <input id="subject" name="subject" required maxLength={CONTACT_LIMITS.subject}
          aria-invalid={!!errors.subject} aria-describedby={describedBy("subject")} />
        {fieldError("subject")}
      </div>

      <div className={styles.field}>
        <label htmlFor="message">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea id="message" name="message" rows={7} required maxLength={CONTACT_LIMITS.message}
          aria-invalid={!!errors.message} aria-describedby={describedBy("message", "message-hint")} />
        <p id="message-hint" className={styles.hint}>
          Between {CONTACT_LIMITS.messageMin} and {CONTACT_LIMITS.message} characters.
        </p>
        {fieldError("message")}
      </div>

      {/* Honeypot for bots: hidden from sighted users and assistive tech. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.field}>
        <div className={styles.checkbox}>
          <input id="consent" name="consent" type="checkbox"
            aria-invalid={!!errors.consent} aria-describedby={describedBy("consent")} />
          <label htmlFor="consent">
            I agree that Public Energy Solutions may use the details above to reply to my enquiry.{" "}
            <span aria-hidden="true">*</span>
          </label>
        </div>
        {fieldError("consent")}
        <Placeholder>Link to the privacy notice to be added once it has been provided by PES.</Placeholder>
      </div>

      <button type="submit" className="button" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
