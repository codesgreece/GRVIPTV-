import nodemailer from "nodemailer";
import { contactConfig } from "@/lib/contact";

export type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function getSmtpConfig() {
  const user = process.env.SMTP_USER ?? contactConfig.email;
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    return null;
  }

  return {
    host: process.env.SMTP_HOST ?? "smtp-mail.outlook.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user, pass },
  };
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  const smtp = getSmtpConfig();

  if (!smtp) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: false,
    auth: smtp.auth,
  });

  const to = process.env.CONTACT_TO_EMAIL ?? contactConfig.email;
  const from = process.env.SMTP_FROM ?? smtp.auth.user;

  await transporter.sendMail({
    from: `GRVIP OTT Contact <${from}>`,
    to,
    replyTo: payload.email,
    subject: `[GRVIP OTT] ${payload.subject}`,
    text: [
      `Όνομα: ${payload.name}`,
      `Email: ${payload.email}`,
      "",
      payload.message,
    ].join("\n"),
    html: `
      <h2>Νέο μήνυμα από τη φόρμα επικοινωνίας</h2>
      <p><strong>Όνομα:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Θέμα:</strong> ${escapeHtml(payload.subject)}</p>
      <hr />
      <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
