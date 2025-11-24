const MessageService = require('../services/messageService');
const User = require('../models/User');

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
});

const wantsJsonResponse = (req) => {
    const acceptHeader = req.headers.accept || '';
    return Boolean(req.xhr)
        || req.get('X-Requested-With') === 'XMLHttpRequest'
        || acceptHeader.includes('application/json')
        || req.is('application/json');
};

const toDisplayName = (user = {}) => {
    const parts = [user.prenom, user.nom].filter(Boolean);
    const fullName = parts.join(' ').trim();
    return fullName || user.login || user.email || `Utilisateur ${user.id}`;
};

const toInitials = (value) => {
    if (!value) {
        return '?';
    }

    const sanitized = String(value)
        .split(/\s|-/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return sanitized.slice(0, 2) || '?';
};

const formatDateTime = (input) => {
    if (!input) {
        return null;
    }

    try {
        const date = input instanceof Date ? input : new Date(input);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return DATE_TIME_FORMATTER.format(date);
    } catch (error) {
        return null;
    }
};

const ROLE_LABELS = {
    admin: 'Administration',
    directeur: 'Directeurs',
    enseignant: 'Enseignants',
    etudiant: 'Étudiants'
};

class MessageController {
    static formatThreadForView(thread, currentUserId) {
        if (!thread) {
            return null;
        }

        const currentId = String(currentUserId);
        const participants = Array.isArray(thread.participants) ? thread.participants.map(String) : [];
        const partnerId = participants.find((id) => id !== currentId) || currentId;
        const participantMeta = thread.participantMeta || {};
        const partnerMeta = participantMeta[partnerId] || null;

        const partnerDisplayName = partnerMeta
            ? partnerMeta.fullName || partnerMeta.email || partnerMeta.login || `Utilisateur ${partnerId}`
            : `Utilisateur ${partnerId}`;

        const unread = thread.unreadCount && thread.unreadCount[currentId]
            ? thread.unreadCount[currentId]
            : 0;

        return {
            id: thread.id,
            partnerId,
            partner: partnerMeta ? {
                id: partnerId,
                fullName: partnerMeta.fullName || partnerDisplayName,
                email: partnerMeta.email || null,
                role: partnerMeta.role || null,
                departementId: partnerMeta.departementId || partnerMeta.departmentId || null
            } : null,
            partnerDisplayName,
            partnerInitials: toInitials(partnerDisplayName),
            unread,
            lastMessagePreview: thread.lastMessage ? thread.lastMessage.content : '',
            lastMessageTime: thread.lastMessage ? formatDateTime(thread.lastMessage.createdAt) : null,
            updatedAtFormatted: formatDateTime(thread.updatedAt),
            url: `/messages/view/${thread.id}`,
            isActive: false,
            raw: thread
        };
    }

    static formatMessageForView(message, currentUserId, participantMeta = {}) {
        const currentId = String(currentUserId);
        const senderId = String(message.senderId);
        const senderMeta = participantMeta[senderId] || null;
        const senderDisplayName = senderMeta
            ? senderMeta.fullName || senderMeta.email || senderMeta.login || `Utilisateur ${senderId}`
            : `Utilisateur ${senderId}`;

        return {
            id: message.id,
            content: message.content,
            senderId,
            senderRole: message.senderRole,
            senderDisplayName,
            senderInitials: toInitials(senderDisplayName),
            createdAt: formatDateTime(message.createdAt),
            rawCreatedAt: message.createdAt,
            isMine: senderId === currentId
        };
    }

    static mapContactsForView(rows) {
        return rows.map((row) => ({
            id: String(row.id),
            displayName: toDisplayName(row),
            role: row.role,
            roleLabel: ROLE_LABELS[row.role] || 'Autres contacts',
            email: row.email || null
        }));
    }

    static groupContactsByRole(contacts) {
        const groupsMap = new Map();

        contacts.forEach((contact) => {
            const roleKey = contact.role || 'autres';
            if (!groupsMap.has(roleKey)) {
                groupsMap.set(roleKey, {
                    role: roleKey,
                    label: ROLE_LABELS[roleKey] || 'Autres contacts',
                    contacts: []
                });
            }
            groupsMap.get(roleKey).contacts.push(contact);
        });

        return Array.from(groupsMap.values()).map((group) => ({
            ...group,
            contacts: group.contacts.sort((a, b) => a.displayName.localeCompare(b.displayName))
        })).sort((a, b) => a.label.localeCompare(b.label));
    }

    static mapSuccessQuery(successValue) {
        if (!successValue) {
            return null;
        }

        if (successValue === 'message-sent') {
            return 'Message envoyé avec succès.';
        }

        return successValue;
    }

    static async sendMessage(req, res) {
        try {
            const { receiverId, receiverLogin, content } = req.body;

            if ((!receiverId || receiverId === '') && (!receiverLogin || receiverLogin === '')) {
                if (wantsJsonResponse(req)) {
                    return res.status(400).json({ error: 'Le destinataire est requis.' });
                }
                const errorMessage = encodeURIComponent('Veuillez sélectionner un destinataire.');
                return res.redirect(`/messages?error=${errorMessage}`);
            }

            if (!content || !content.trim()) {
                if (wantsJsonResponse(req)) {
                    return res.status(400).json({ error: 'Le contenu du message est requis.' });
                }
                const errorMessage = encodeURIComponent('Le contenu du message est requis.');
                return res.redirect(`/messages?error=${errorMessage}`);
            }

            const sender = await User.findById(req.user.id);
            if (!sender) {
                if (wantsJsonResponse(req)) {
                    return res.status(401).json({ error: 'Utilisateur connecté introuvable.' });
                }
                const errorMessage = encodeURIComponent('Session invalide, veuillez vous reconnecter.');
                return res.redirect(`/auth/login?error=${errorMessage}`);
            }

            let recipient = null;
            if (receiverId) {
                recipient = await User.findById(Number.parseInt(receiverId, 10));
            } else if (receiverLogin) {
                recipient = await User.findByLogin(receiverLogin.trim());
            }

            if (!recipient) {
                if (wantsJsonResponse(req)) {
                    return res.status(404).json({ error: 'Destinataire introuvable.' });
                }
                const errorMessage = encodeURIComponent('Destinataire introuvable ou non autorisé.');
                return res.redirect(`/messages?error=${errorMessage}`);
            }

            const canCommunicate = MessageService.canUsersCommunicate(sender, recipient);
            if (!canCommunicate.allowed) {
                if (wantsJsonResponse(req)) {
                    return res.status(403).json({ error: canCommunicate.reason });
                }
                const errorMessage = encodeURIComponent(canCommunicate.reason);
                return res.redirect(`/messages?error=${errorMessage}`);
            }

            const { threadId, message, thread } = await MessageService.sendMessage({
                sender,
                recipient,
                content: content.trim()
            });

            if (wantsJsonResponse(req)) {
                return res.status(201).json({
                    threadId,
                    message,
                    thread
                });
            }

            return res.redirect(`/messages/view/${threadId}?success=message-sent`);
        } catch (error) {
            console.error('Erreur envoi message:', error);
            if (wantsJsonResponse(req)) {
                return res.status(500).json({ error: 'Impossible d\'envoyer le message pour le moment.' });
            }
            const errorMessage = encodeURIComponent('Impossible d\'envoyer le message pour le moment.');
            return res.redirect(`/messages?error=${errorMessage}`);
        }
    }

    static async listThreads(req, res) {
        try {
            const threads = await MessageService.listThreadsForUser(req.user.id, {
                limit: Number.parseInt(req.query.limit, 10) || 50
            });
            return res.json({ threads });
        } catch (error) {
            console.error('Erreur récupération threads:', error);

            if (error.code === 9) {
                return res.status(500).json({
                    error: 'Indexer Firestore est requis pour cette requête. Veuillez créer l\'index suggéré dans la console Firebase.'
                });
            }

            return res.status(500).json({ error: 'Impossible de charger les conversations.' });
        }
    }

    static async getThread(req, res) {
        try {
            const { threadId } = req.params;
            const { limit, order } = req.query;

            const thread = await MessageService.getThread(threadId, req.user.id);
            if (!thread) {
                return res.status(404).json({ error: 'Conversation introuvable ou accès non autorisé.' });
            }

            const messages = await MessageService.getMessagesForThread(threadId, {
                limit: Number.parseInt(limit, 10) || 50,
                order: order === 'desc' ? 'desc' : 'asc'
            });

            return res.json({ thread, messages });
        } catch (error) {
            console.error('Erreur récupération conversation:', error);
            return res.status(500).json({ error: 'Impossible de charger la conversation.' });
        }
    }

    static async markThreadAsRead(req, res) {
        try {
            const { threadId } = req.params;
            const { messageIds } = req.body || {};

            const thread = await MessageService.getThread(threadId, req.user.id);
            if (!thread) {
                return res.status(404).json({ error: 'Conversation introuvable ou accès non autorisé.' });
            }

            const updatedThread = await MessageService.markMessagesAsRead(
                threadId,
                req.user.id,
                Array.isArray(messageIds) ? messageIds : []
            );
            return res.json({ thread: updatedThread });
        } catch (error) {
            console.error('Erreur marquage lecture:', error);
            return res.status(500).json({ error: 'Impossible de mettre à jour le statut de lecture.' });
        }
    }

    static async listContacts(req, res) {
        try {
            const rows = await User.findContactsForUser(req.user);
            const contacts = MessageController.mapContactsForView(rows);
            return res.json({ contacts });
        } catch (error) {
            console.error('Erreur récupération contacts:', error);
            return res.status(500).json({ error: 'Impossible de charger la liste des destinataires.' });
        }
    }

    static async buildSidebarData(req) {
        const [threadsRaw, contactsRaw] = await Promise.all([
            MessageService.listThreadsForUser(req.user.id, { limit: 50 }),
            User.findContactsForUser(req.user)
        ]);

        const threads = threadsRaw.map((thread) => MessageController.formatThreadForView(thread, req.user.id));
        const contacts = MessageController.mapContactsForView(contactsRaw);
        const contactsGrouped = MessageController.groupContactsByRole(contacts);

        return { threads, contacts, contactsGrouped };
    }

    static async renderInbox(req, res) {
        try {
            const { threads, contacts, contactsGrouped } = await MessageController.buildSidebarData(req);
            const successMessage = MessageController.mapSuccessQuery(req.query.success);
            const errorMessage = req.query.error || null;

            res.render('messages/inbox', {
                layout: 'main',
                title: 'Messagerie',
                threads,
                contacts,
                contactsGrouped,
                selectedThread: null,
                messages: [],
                hasThreads: threads.length > 0,
                hasContacts: contacts.length > 0,
                successMessage,
                errorMessage
            });
        } catch (error) {
            console.error('Erreur affichage messagerie:', error);
            res.status(500).render('error', {
                layout: 'main',
                title: 'Erreur messagerie',
                message: 'Impossible de charger la messagerie pour le moment.'
            });
        }
    }

    static async renderThread(req, res) {
        try {
            const { threadId } = req.params;
            const [sidebarData, thread] = await Promise.all([
                MessageController.buildSidebarData(req),
                MessageService.getThread(threadId, req.user.id)
            ]);

            if (!thread) {
                const errorMessage = encodeURIComponent('Conversation introuvable ou accès non autorisé.');
                return res.redirect(`/messages?error=${errorMessage}`);
            }

            const messagesRaw = await MessageService.getMessagesForThread(threadId, {
                limit: 200,
                order: 'asc'
            });

            const currentId = String(req.user.id);
            const unreadMessages = messagesRaw.filter((message) => {
                const readers = Array.isArray(message.readBy) ? message.readBy.map(String) : [];
                return !readers.includes(currentId);
            });

            let updatedThread = thread;
            if (unreadMessages.length) {
                updatedThread = await MessageService.markMessagesAsRead(
                    threadId,
                    req.user.id,
                    unreadMessages.map((message) => message.id)
                );
            }

            const threads = sidebarData.threads.map((item) => ({
                ...item,
                isActive: item.id === threadId,
                unread: item.id === threadId ? 0 : item.unread
            }));

            const selectedThread = MessageController.formatThreadForView(updatedThread, req.user.id);
            selectedThread.isActive = true;

            const participantMeta = updatedThread.participantMeta || {};
            const messages = messagesRaw.map((message) => MessageController.formatMessageForView(
                message,
                req.user.id,
                participantMeta
            ));

            const successMessage = MessageController.mapSuccessQuery(req.query.success);
            const errorMessage = req.query.error || null;

            res.render('messages/inbox', {
                layout: 'main',
                title: 'Messagerie',
                threads,
                contacts: sidebarData.contacts,
                contactsGrouped: sidebarData.contactsGrouped,
                selectedThread,
                messages,
                hasThreads: threads.length > 0,
                hasContacts: sidebarData.contacts.length > 0,
                successMessage,
                errorMessage
            });
        } catch (error) {
            console.error('Erreur affichage conversation:', error);
            const errorMessage = encodeURIComponent('Impossible d\'afficher la conversation.');
            res.redirect(`/messages?error=${errorMessage}`);
        }
    }
}

module.exports = MessageController;
