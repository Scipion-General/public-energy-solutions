import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS, validateContact } from "./validation";

const valid = {
  name: "Jane Doe",
  email: "jane@example.org",
  organisation: "Example Council",
  organisationType: "Public sector body",
  subject: "Procurement question",
  message: "We would like to discuss our gas contract.",
  consent: true,
  website: "",
};

describe("validateContact", () => {
  it("accepts a valid submission and trims values", () => {
    const r = validateContact({ ...valid, name: "  Jane Doe  " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Jane Doe");
      expect(r.isSpam).toBe(false);
    }
  });

  it("accepts optional fields left empty", () => {
    expect(validateContact({ ...valid, organisation: "", organisationType: "" }).ok).toBe(true);
  });

  it("reports all required fields when empty", () => {
    const r = validateContact({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["consent", "email", "message", "name", "subject"]);
  });

  it("handles non-object input", () => {
    expect(validateContact(null).ok).toBe(false);
    expect(validateContact("x").ok).toBe(false);
  });

  it.each(["plain", "a@b", "a@b.c", "a b@c.de", "a@b c.de", "<a@b.de>"])("rejects invalid email %s", (email) => {
    const r = validateContact({ ...valid, email });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toBeDefined();
  });

  it("rejects too-short and too-long messages", () => {
    const short = validateContact({ ...valid, message: "short" });
    const long = validateContact({ ...valid, message: "x".repeat(CONTACT_LIMITS.message + 1) });
    expect(!short.ok && short.errors.message).toMatch(/at least/);
    expect(!long.ok && long.errors.message).toMatch(/at most/);
  });

  it("rejects over-long name and subject", () => {
    const r = validateContact({ ...valid, name: "n".repeat(101), subject: "s".repeat(151) });
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["name", "subject"]);
  });

  it("rejects unknown organisation type", () => {
    const r = validateContact({ ...valid, organisationType: "Hacker" });
    expect(!r.ok && r.errors.organisationType).toBeTruthy();
  });

  it("requires consent; accepts form-style 'on'/'true'", () => {
    expect(validateContact({ ...valid, consent: false }).ok).toBe(false);
    expect(validateContact({ ...valid, consent: "on" }).ok).toBe(true);
    expect(validateContact({ ...valid, consent: "true" }).ok).toBe(true);
  });

  it("strips newlines from header-bound fields (email header injection)", () => {
    const r = validateContact({ ...valid, subject: "Hi\r\nBcc: victim@example.org" });
    expect(r.ok && r.data.subject).toBe("Hi Bcc: victim@example.org");
  });

  it("flags honeypot submissions as spam", () => {
    const r = validateContact({ ...valid, website: "http://spam" });
    expect(r.ok && r.isSpam).toBe(true);
  });

  it("ignores non-string values", () => {
    const r = validateContact({ ...valid, name: 42 });
    expect(!r.ok && r.errors.name).toBeTruthy();
  });
});
