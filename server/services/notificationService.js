import Notification from "../models/Notification.js";
import resend from "../config/mail.js";

/**
 * Create a new in-app notification
 * for a specific recipient.
 */
export const createNotification = async ({
    recipient,
    type,
    message,
    relatedLeave = null
}) => {
    try {

        const notif = await Notification.create({
            recipient,
            type,
            message,
            relatedLeave
        });

        return notif;

    } catch (err) {

        console.error(
            "createNotification error:",
            err.message
        );

        return null;
    }
};


/**
 * Send leave notification email using Resend.
 */
export const sendLeaveEmail = async ({
    to,
    subject,
    html
}) => {

    if (!process.env.RESEND_API_KEY) {

        console.warn(
            "sendLeaveEmail: RESEND_API_KEY is not configured."
        );

        return null;
    }

    if (!to) {

        console.warn(
            "sendLeaveEmail: recipient email is missing."
        );

        return null;
    }

    try {

        const { data, error } =
            await resend.emails.send({

                from: "HRMS Notifications <noreply@team2026.online>",

                to: [to],

                subject,

                html
            });

        if (error) {

            console.error(
                "Resend leave email error:",
                error
            );

            return null;
        }

        console.log(
            "Leave email sent successfully:",
            data
        );

        return data;

    } catch (err) {

        console.error(
            "sendLeaveEmail error:",
            err.message
        );

        return null;
    }
};