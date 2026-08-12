import Notification from "../models/Notification.js";
import transporter from "../config/mail.js";

/**
 * Create a new in-app notification for a specific recipient.
 */
export const createNotification = async ({ recipient, type, message, relatedLeave = null }) => {
  try {
    const notif = await Notification.create({ recipient, type, message, relatedLeave });
    return notif;
  } catch (err) {
    console.error("createNotification error:", err.message);
    return null;
  }
};

/**
 * Send an email using the existing Nodemailer transporter.
 * Fails silently if credentials are not configured — does NOT throw.
 */
export const sendLeaveEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    // Email credentials not configured — skip silently
    console.warn("sendLeaveEmail: EMAIL credentials not set in .env — skipping email.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `HRMS Notifications <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Non-fatal — log but don't crash the main request
    console.error("sendLeaveEmail error:", err.message);
  }
};
