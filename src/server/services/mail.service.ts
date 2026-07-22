import nodemailer from "nodemailer";
import { AppError } from "@/server/utils/errors";

type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromAddress: string;
  fromName: string;
};

function getMailConfig(): MailConfig {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT ?? 587);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const fromAddress = process.env.MAIL_FROM_ADDRESS;
  const fromName = process.env.MAIL_FROM_NAME ?? "EviMersin";

  if (!host || !user || !pass || !fromAddress) {
    throw new AppError("Email service is not configured", 503);
  }

  return {
    host,
    port,
    user,
    pass,
    fromAddress,
    fromName,
  };
}

function getTransporter() {
  const config = getMailConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

export type ContactEmailInput = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

function getAdminNotifyEmail(config: MailConfig) {
  return (
    process.env.MAIL_ORDER_NOTIFY_TO ??
    process.env.MAIL_FROM_ADDRESS ??
    config.fromAddress
  );
}

export const mailService = {
  async sendPasswordResetOtp(input: {
    to: string;
    username: string;
    adminName: string;
    otp: string;
  }) {
    const config = getMailConfig();
    const transporter = getTransporter();

    const text = [
      "Admin password reset request",
      "",
      `Username: ${input.username}`,
      `Name: ${input.adminName}`,
      "",
      `Your OTP code: ${input.otp}`,
      "",
      "This code expires in 10 minutes.",
      "If you did not request this, you can ignore this email.",
    ].join("\n");

    const html = `
      <h2>Admin password reset</h2>
      <p><strong>Username:</strong> ${escapeHtml(input.username)}</p>
      <p><strong>Name:</strong> ${escapeHtml(input.adminName)}</p>
      <p style="margin:24px 0;font-size:28px;font-weight:700;letter-spacing:0.2em">${escapeHtml(input.otp)}</p>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    try {
      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: input.to,
        subject: "[EviMersin Admin] Password reset OTP",
        text,
        html,
      });
    } catch (error) {
      console.error("[mail] Failed to send password reset OTP:", error);
      throw new AppError("Unable to send OTP email right now. Please try again later.", 502);
    }
  },

  async sendContactNotification(input: ContactEmailInput) {
    const config = getMailConfig();
    const notifyTo = getAdminNotifyEmail(config);

    const transporter = getTransporter();

    const text = [
      "New contact form message",
      "",
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      input.phone ? `Phone: ${input.phone}` : null,
      `Subject: ${input.subject}`,
      "",
      "Message:",
      input.message,
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <h2>New contact form message</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></p>
      ${input.phone ? `<p><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>` : ""}
      <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    `;

    try {
      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: notifyTo,
        replyTo: `"${input.name}" <${input.email}>`,
        subject: `[EviMersin Contact] ${input.subject}`,
        text,
        html,
      });
    } catch (error) {
      console.error("[mail] Failed to send contact notification:", error);
      throw new AppError("Unable to send email right now. Please try again later.", 502);
    }
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
