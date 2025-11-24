const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class NotificationService {
    static transporter = null;

    static async notify(targetUser, options = {}) {
        if (!targetUser) {
            return;
        }

        const title = options.title || 'Nouvelle notification';
        const message = options.message || '';
        const payload = options.payload || {};
        const requestedChannels = Array.isArray(options.channels)
            ? options.channels
            : options.channels
                ? [options.channels]
                : ['push'];

        const channels = [...new Set(requestedChannels.filter(Boolean))];
        if (!channels.length) {
            channels.push('push');
        }

        await Promise.all(channels.map(async (channel) => {
            if (channel === 'email' && !targetUser.email) {
                    console.info("Notification email ignorée (email non configuré pour l'utilisateur).");
                return;
            }

            await Notification.create({
                user_id: targetUser.id,
                user_role: targetUser.role,
                channel,
                title,
                message,
                payload
            });

            if (channel === 'email') {
                await NotificationService._sendEmail(targetUser, title, message);
            }

            if (channel === 'push') {
                console.info(`📣 Notification push envoyée à ${targetUser.login || targetUser.email}: ${title}`);
            }
        }));
    }

    static _canSendEmail() {
        return process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    }

    static _getTransporter() {
        if (NotificationService.transporter) {
            return NotificationService.transporter;
        }

        if (!NotificationService._canSendEmail()) {
            return null;
        }

        NotificationService.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        return NotificationService.transporter;
    }

    static async _sendEmail(user, subject, text) {
        const transporter = NotificationService._getTransporter();
        if (!transporter) {
            console.info('Email non envoyé: transporteur incomplet.');
            return;
        }

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: user.email,
                subject,
                text
            });
            console.info(`✉️ Email envoyé à ${user.email}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de notification:', error);
        }
    }
}

module.exports = NotificationService;
