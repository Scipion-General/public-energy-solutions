import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMessage, MailerConfigError, selectProvider, sendContactEmail, smtpOptions, DEFAULT_CONTACT_TO } from "./mailer";

const input = {
  name: 'Jane "J" Doe',
  email: "jane@example.org",
  organisation: "",
  organisationType: "",
  subject: "Hello",
  message: "A message long enough.",
  consent: true,
  website: "",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("selectProvider", () => {
  it("defaults to smtp, switches to resend when a key is set", () => {
    vi.stubEnv("MAIL_PROVIDER", "");
    vi.stubEnv("RESEND_API_KEY", "");
    expect(selectProvider()).toBe("smtp");
    vi.stubEnv("RESEND_API_KEY", "re_x");
    expect(selectProvider()).toBe("resend");
  });
  it("honours MAIL_PROVIDER and rejects unknown values", () => {
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("MAIL_PROVIDER", "SMTP");
    expect(selectProvider()).toBe("smtp");
    vi.stubEnv("MAIL_PROVIDER", "gmail");
    expect(() => selectProvider()).toThrow(MailerConfigError);
  });
});

describe("smtpOptions", () => {
  const base = () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_USER", "u");
    vi.stubEnv("SMTP_PASSWORD", "p");
  };
  it("defaults to port 587 without implicit TLS", () => {
    base();
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_SECURE", "");
    expect(smtpOptions()).toMatchObject({ host: "smtp.example.com", port: 587, secure: false });
  });
  it("uses implicit TLS on 465 and parses SMTP_SECURE loosely", () => {
    base();
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_SECURE", "");
    expect(smtpOptions().secure).toBe(true);
    vi.stubEnv("SMTP_SECURE", "FALSE");
    expect(smtpOptions().secure).toBe(false);
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_SECURE", "1");
    expect(smtpOptions().secure).toBe(true);
  });
  it("names the missing variable", () => {
    base();
    vi.stubEnv("SMTP_PASSWORD", "  ");
    expect(() => smtpOptions()).toThrow(/SMTP_PASSWORD/);
  });
  it("rejects invalid ports", () => {
    base();
    vi.stubEnv("SMTP_PORT", "abc");
    expect(() => smtpOptions()).toThrow(/SMTP_PORT/);
  });
});

describe("buildMessage", () => {
  it("requires CONTACT_FROM_EMAIL", () => {
    vi.stubEnv("CONTACT_FROM_EMAIL", "");
    expect(() => buildMessage(input)).toThrow(/CONTACT_FROM_EMAIL/);
  });
  it("uses default recipient and a safe reply-to", () => {
    vi.stubEnv("CONTACT_FROM_EMAIL", "web@example.com");
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    const m = buildMessage(input);
    expect(m.to).toBe(DEFAULT_CONTACT_TO);
    expect(m.replyTo).toBe("Jane J Doe <jane@example.org>");
    expect(m.subject).toBe("[PES website] Hello");
  });
});

describe("sendContactEmail via Resend", () => {
  it("posts to the Resend API with the key", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("MAIL_PROVIDER", "");
    vi.stubEnv("CONTACT_FROM_EMAIL", "web@example.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await sendContactEmail(input);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body)).toMatchObject({ from: "web@example.com", to: [DEFAULT_CONTACT_TO], subject: "[PES website] Hello" });
  });
  it("reports API errors", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM_EMAIL", "web@example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("domain not verified", { status: 403 })));
    await expect(sendContactEmail(input)).rejects.toThrow(/403: domain not verified/);
  });
});
