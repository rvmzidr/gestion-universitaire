const db = require('../config/database');

class Notification {
    static async create(data) {
        const {
            user_id,
            user_role,
            channel,
            title,
            message,
            payload
        } = data;

        let preparedPayload = null;
        if (payload) {
            preparedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
        }

        const [result] = await db.query(
            `INSERT INTO notifications (user_id, user_role, channel, title, message, payload)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, user_role, channel, title, message, preparedPayload]
        );

        return result.insertId;
    }

    static async listForUser(userId) {
        const [rows] = await db.query(
            `SELECT id, channel, title, message, payload, is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 200`,
            [userId]
        );
        return rows;
    }

    static async countUnread(userId) {
        const [rows] = await db.query(
            `SELECT COUNT(*) as total
             FROM notifications
             WHERE user_id = ?
               AND is_read = 0`,
            [userId]
        );
        return rows[0]?.total || 0;
    }

    static async markAsRead(notificationId, userId) {
        await db.query(
            `UPDATE notifications
             SET is_read = 1
             WHERE id = ?
               AND user_id = ?`,
            [notificationId, userId]
        );
    }

    static async markAllAsRead(userId) {
        await db.query(
            `UPDATE notifications
             SET is_read = 1
             WHERE user_id = ?`,
            [userId]
        );
    }
}

module.exports = Notification;
