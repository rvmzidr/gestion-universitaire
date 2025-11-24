const Notification = require('../models/Notification');

class NotificationController {
    static async index(req, res) {
        try {
            const notifications = await Notification.listForUser(req.user.id);
            res.render('notifications/index', {
                layout: 'main',
                title: 'Notifications',
                notifications
            });
        } catch (error) {
            console.error('Erreur lors de la lecture des notifications:', error);
            res.render('notifications/index', {
                layout: 'main',
                title: 'Notifications',
                notifications: [],
                error: 'Impossible de récupérer vos notifications pour le moment.'
            });
        }
    }

    static async markRead(req, res) {
        try {
            await Notification.markAsRead(req.params.id, req.user.id);
            res.redirect('/notifications?success=notification');
        } catch (error) {
            console.error('Erreur lors du marquage notification comme lue:', error);
            res.redirect('/notifications?error=lecture');
        }
    }

    static async markAllRead(req, res) {
        try {
            await Notification.markAllAsRead(req.user.id);
            res.redirect('/notifications?success=notifications');
        } catch (error) {
            console.error('Erreur lors du marquage toutes les notifications comme lues:', error);
            res.redirect('/notifications?error=lecture');
        }
    }
}

module.exports = NotificationController;
