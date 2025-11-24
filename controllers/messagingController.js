const Message = require('../models/Message');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');

class MessagingController {
    static async index(req, res) {
        return MessagingController._renderPage(req, res);
    }

    static async sendMessage(req, res) {
        const formData = {
            subject: req.body.subject || '',
            body: req.body.body || ''
        };

        const recipientId = MessagingController._normalizeId(req.body.recipient_id);
        if (!recipientId) {
            return MessagingController._renderPage(req, res, {
                error: 'Veuillez sélectionner un destinataire valide.',
                formData,
                selectedContactId: recipientId
            });
        }

        if (recipientId === req.user.id) {
            return MessagingController._renderPage(req, res, {
                error: 'Vous ne pouvez pas vous envoyer un message.',
                formData,
                selectedContactId: recipientId
            });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return MessagingController._renderPage(req, res, {
                error: 'Le destinataire demandé est introuvable.',
                formData,
                selectedContactId: recipientId
            });
        }

        try {
            await Message.create({
                sender_id: req.user.id,
                sender_role: req.user.role,
                recipient_id: recipient.id,
                recipient_role: recipient.role,
                subject: (req.body.subject || '').trim(),
                body: (req.body.body || '').trim()
            });

            const channelInput = req.body.channels;
            const requestedChannels = Array.isArray(channelInput)
                ? channelInput
                : channelInput
                    ? [channelInput]
                    : [];

            const channels = requestedChannels.length ? requestedChannels : ['push'];

            await NotificationService.notify(recipient, {
                title: `${req.user.prenom} ${req.user.nom} vous a envoyé un message`,
                message: (req.body.body || '').substring(0, 160),
                channels,
                payload: {
                    sender_id: req.user.id,
                    type: 'message'
                }
            });

            res.redirect(`/messagerie?contact=${recipient.id}&success=message`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            return MessagingController._renderPage(req, res, {
                error: 'Impossible d\'envoyer le message pour le moment.',
                formData,
                selectedContactId: recipientId
            });
        }
    }

    static async _renderPage(req, res, extras = {}) {
        const formData = extras.formData || { subject: '', body: '' };
        const demoContactId = await MessagingController._ensureDemoConversation(req.user);
        const contacts = await Message.getContacts(req.user.id);
        const recipients = await User.findAllExcept(req.user.id);

        const preferredContactId = MessagingController._normalizeId(extras.selectedContactId) 
            ?? MessagingController._normalizeId(req.query.contact) 
            ?? demoContactId
            ?? contacts[0]?.contact_id
            ?? recipients[0]?.id
            ?? null;

        const selectedContact = preferredContactId
            ? await User.findById(preferredContactId)
            : null;

        const conversation = preferredContactId
            ? await Message.getConversation(req.user.id, preferredContactId)
            : [];

        if (preferredContactId) {
            await Message.markAsReadForUser(req.user.id, preferredContactId);
        }

        res.render('messagerie/index', {
            layout: 'main',
            title: 'Messagerie interne',
            contacts,
            recipients,
            conversation,
            selectedContact,
            selectedContactId: preferredContactId,
            formData,
            success: extras.success || req.query.success || null,
            error: extras.error || null
        });
    }

    static _normalizeId(value) {
        const candidate = Number(value);
        return Number.isNaN(candidate) ? null : candidate;
    }

    static async _ensureDemoConversation(user) {
        if (!user) {
            return null;
        }

        if (user.role === 'etudiant') {
            const mentor = await User.findFirstByRole('enseignant');
            if (!mentor) {
                return null;
            }

            const exists = await Message.conversationExists(user.id, mentor.id);
            if (!exists) {
                await Message.create({
                    sender_id: user.id,
                    sender_role: user.role,
                    recipient_id: mentor.id,
                    recipient_role: mentor.role,
                    subject: 'Demande de précisions',
                    body: 'Bonjour, j\'aurais besoin d\'un créneau pour discuter du projet en cours.'
                });

                await Message.create({
                    sender_id: mentor.id,
                    sender_role: mentor.role,
                    recipient_id: user.id,
                    recipient_role: user.role,
                    subject: 'Re: Demande de précisions',
                    body: 'Bonjour, je suis disponible jeudi 10h pour en discuter. Souhaitez-vous un rappel ?'
                });
            }

            return mentor.id;
        }

        if (user.role === 'enseignant') {
            const mentee = await User.findFirstByRole('etudiant');
            if (!mentee) {
                return null;
            }

            const exists = await Message.conversationExists(user.id, mentee.id);
            if (!exists) {
                await Message.create({
                    sender_id: mentee.id,
                    sender_role: mentee.role,
                    recipient_id: user.id,
                    recipient_role: user.role,
                    subject: 'Besoin de votre aide',
                    body: 'Bonjour, serait-il possible d\'avoir un retour sur le devoir rendu ?'
                });

                await Message.create({
                    sender_id: user.id,
                    sender_role: user.role,
                    recipient_id: mentee.id,
                    recipient_role: mentee.role,
                    subject: 'Re: Besoin de votre aide',
                    body: 'Oui bien sûr. Je peux fixer un créneau vendredi 15h.'
                });
            }

            return mentee.id;
        }

        return null;
    }
}

module.exports = MessagingController;
