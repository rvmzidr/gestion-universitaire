const db = require('../config/database');

class Message {
    static async create(payload) {
        const {
            sender_id,
            sender_role,
            recipient_id,
            recipient_role,
            subject,
            body
        } = payload;

        const preparedSubject = subject ? String(subject).trim().substring(0, 255) : '';
        const preparedBody = body ? String(body).trim() : '';

        const [result] = await db.query(
            `INSERT INTO messages (sender_id, sender_role, recipient_id, recipient_role, subject, body)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                sender_id,
                sender_role,
                recipient_id,
                recipient_role,
                preparedSubject,
                preparedBody
            ]
        );

        return result.insertId;
    }

    static async getConversation(userId, contactId) {
        const [rows] = await db.query(
            `SELECT m.*
             FROM messages m
             WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
             ORDER BY m.created_at ASC`,
            [userId, contactId, contactId, userId]
        );
        return rows;
    }

    static async getContacts(userId) {
        const [rows] = await db.query(
            `SELECT u.id as contact_id,
                    u.nom,
                    u.prenom,
                    u.role,
                    MAX(m.created_at) as last_message_date,
                    SUM(CASE WHEN m.recipient_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) as unread_count
             FROM messages m
             JOIN utilisateurs u ON u.id = CASE
                 WHEN m.sender_id = ? THEN m.recipient_id
                 ELSE m.sender_id
             END
             WHERE (m.sender_id = ? OR m.recipient_id = ?)
               AND u.id != ?
             GROUP BY u.id, u.nom, u.prenom, u.role
             ORDER BY last_message_date DESC`,
            [userId, userId, userId, userId, userId]
        );
        return rows;
    }

    static async markAsReadForUser(userId, contactId) {
        await db.query(
            `UPDATE messages
             SET is_read = 1
             WHERE recipient_id = ?
               AND sender_id = ?
               AND is_read = 0`,
            [userId, contactId]
        );
    }

    static async conversationExists(userId, contactId) {
        const [rows] = await db.query(
            `SELECT COUNT(*) as total
             FROM messages
             WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)`,
            [userId, contactId, contactId, userId]
        );
        return rows[0].total > 0;
    }
}

module.exports = Message;
