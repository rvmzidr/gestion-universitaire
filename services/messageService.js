const { getFirebaseAdmin } = require('../config/firebaseAdmin');
const admin = getFirebaseAdmin();
const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const COLLECTION_THREADS = 'threads';
const COLLECTION_NOTIFICATIONS = 'notifications';

function normalizeUser(user) {
    if (!user) {
        return null;
    }

    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();

    return {
        id: String(user.id),
        role: user.role,
        departementId: user.id_departement || null,
        email: user.email || null,
        fullName: fullName || user.login || `Utilisateur ${user.id}`
    };
}

function toIsoDate(value) {
    if (!value) {
        return null;
    }
    if (value.toDate) {
        return value.toDate().toISOString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}

class MessageService {
    static generateThreadId(userA, userB) {
        const sorted = [String(userA), String(userB)].sort();
        return sorted.join('_');
    }

    static getThreadRef(threadId) {
        return firestore.collection(COLLECTION_THREADS).doc(threadId);
    }

    static buildParticipantMeta(user) {
        const normalized = normalizeUser(user);
        return {
            id: normalized.id,
            role: normalized.role,
            fullName: normalized.fullName,
            departementId: normalized.departementId,
            email: normalized.email
        };
    }

    static canUsersCommunicate(sender, recipient) {
        const allowed = {
            allowed: false,
            reason: 'Communication non autorisée pour ces rôles.'
        };

        if (!sender || !recipient) {
            return allowed;
        }

        if (String(sender.id) === String(recipient.id)) {
            return {
                allowed: false,
                reason: 'Vous ne pouvez pas vous envoyer un message à vous-même.'
            };
        }

        const senderRole = sender.role;
        const recipientRole = recipient.role;

        const requireSameDepartment = () => {
            if (!sender.id_departement) {
                return {
                    allowed: false,
                    reason: 'Votre profil n\'a pas de département associé.'
                };
            }

            if (!recipient.id_departement) {
                return {
                    allowed: false,
                    reason: 'Le destinataire n\'a pas de département associé.'
                };
            }

            if (String(sender.id_departement) !== String(recipient.id_departement)) {
                return {
                    allowed: false,
                    reason: 'Vous ne pouvez contacter que les membres de votre département.'
                };
            }

            return { allowed: true };
        };

        if (senderRole === 'admin') {
            return { allowed: true };
        }

        if (senderRole === 'directeur') {
            if (recipientRole === 'admin') {
                return { allowed: true };
            }

            if (!sender.id_departement) {
                return {
                    allowed: false,
                    reason: 'Votre profil directeur n\'a pas de département associé.'
                };
            }

            if (!recipient.id_departement) {
                return {
                    allowed: false,
                    reason: 'Le destinataire n\'a pas de département associé.'
                };
            }

            if (String(sender.id_departement) !== String(recipient.id_departement)) {
                return {
                    allowed: false,
                    reason: 'Vous ne pouvez contacter que les membres de votre département.'
                };
            }

            if (['enseignant', 'etudiant'].includes(recipientRole)) {
                return { allowed: true };
            }

            return allowed;
        }

        if (senderRole === 'enseignant') {
            if (recipientRole === 'admin') {
                return { allowed: true };
            }

            if (!['etudiant', 'directeur'].includes(recipientRole)) {
                return {
                    allowed: false,
                    reason: 'Les enseignants ne peuvent contacter que les étudiants, directeurs ou l\'administration.'
                };
            }

            const departmentCheck = requireSameDepartment();
            if (!departmentCheck.allowed) {
                return departmentCheck;
            }

            return { allowed: true };
        }

        if (senderRole === 'etudiant') {
            if (recipientRole === 'admin') {
                return { allowed: true };
            }

            if (recipientRole !== 'enseignant') {
                return {
                    allowed: false,
                    reason: 'Les étudiants ne peuvent contacter que leurs enseignants ou l\'administration.'
                };
            }

            const departmentCheck = requireSameDepartment();
            if (!departmentCheck.allowed) {
                return departmentCheck;
            }

            return { allowed: true };
        }

        return allowed;
    }

    static serializeThread(doc) {
        if (!doc) {
            return null;
        }
        const data = doc.data();
        if (!data) {
            return null;
        }
        const thread = {
            id: doc.id,
            participants: data.participants || [],
            participantMeta: data.participantMeta || {},
            createdAt: toIsoDate(data.createdAt),
            updatedAt: toIsoDate(data.updatedAt),
            unreadCount: data.unreadCount || {},
            lastMessage: data.lastMessage ? {
                ...data.lastMessage,
                createdAt: toIsoDate(data.lastMessage.createdAt)
            } : null
        };
        return thread;
    }

    static serializeMessage(doc) {
        if (!doc) {
            return null;
        }
        const data = doc.data ? doc.data() : doc;
        if (!data) {
            return null;
        }
        return {
            id: data.id,
            threadId: data.threadId,
            content: data.content,
            senderId: data.senderId,
            senderRole: data.senderRole,
            receiverId: data.receiverId,
            receiverRole: data.receiverRole,
            createdAt: toIsoDate(data.createdAt),
            readBy: data.readBy || []
        };
    }

    static async ensureThreadExists(sender, recipient, content) {
        const senderId = String(sender.id);
        const recipientId = String(recipient.id);
        const threadId = this.generateThreadId(senderId, recipientId);
        const threadRef = this.getThreadRef(threadId);
        const messageRef = threadRef.collection('messages').doc();

        await firestore.runTransaction(async (transaction) => {
            const now = FieldValue.serverTimestamp();
            const threadSnap = await transaction.get(threadRef);

            if (!threadSnap.exists) {
                transaction.set(threadRef, {
                    participants: [senderId, recipientId],
                    participantMeta: {
                        [senderId]: this.buildParticipantMeta(sender),
                        [recipientId]: this.buildParticipantMeta(recipient)
                    },
                    createdAt: now,
                    updatedAt: now,
                    lastMessage: {
                        id: messageRef.id,
                        content,
                        senderId,
                        senderRole: sender.role,
                        createdAt: now
                    },
                    unreadCount: {
                        [senderId]: 0,
                        [recipientId]: 1
                    }
                });
            } else {
                const threadData = threadSnap.data() || {};
                const unreadCount = {
                    ...(threadData.unreadCount || {})
                };
                unreadCount[senderId] = 0;
                unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;

                transaction.update(threadRef, {
                    updatedAt: now,
                    [`participantMeta.${senderId}`]: this.buildParticipantMeta(sender),
                    [`participantMeta.${recipientId}`]: this.buildParticipantMeta(recipient),
                    lastMessage: {
                        id: messageRef.id,
                        content,
                        senderId,
                        senderRole: sender.role,
                        createdAt: now
                    },
                    unreadCount
                });
            }

            transaction.set(messageRef, {
                id: messageRef.id,
                threadId,
                content,
                senderId,
                senderRole: sender.role,
                receiverId: recipientId,
                receiverRole: recipient.role,
                createdAt: now,
                readBy: [senderId]
            });
        });

        const [messageSnap, threadSnap] = await Promise.all([
            threadRef.collection('messages').doc(messageRef.id).get(),
            threadRef.get()
        ]);

        const message = this.serializeMessage(messageSnap);
        const thread = this.serializeThread(threadSnap);

        return { threadId, message, thread };
    }

    static async createNotification(recipient, sender, threadId, message) {
        try {
            const notificationsRef = firestore.collection(COLLECTION_NOTIFICATIONS).doc();
            await notificationsRef.set({
                id: notificationsRef.id,
                userId: String(recipient.id),
                type: 'message',
                threadId,
                messageId: message.id,
                title: `Nouveau message de ${sender.prenom || ''} ${sender.nom || ''}`.trim(),
                body: message.content.length > 160 ? `${message.content.slice(0, 157)}...` : message.content,
                read: false,
                createdAt: FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Erreur lors de la création de la notification Firestore:', error.message);
        }
    }

    static async sendMessage({ sender, recipient, content }) {
        const { threadId, message, thread } = await this.ensureThreadExists(sender, recipient, content);

        await this.createNotification(recipient, sender, threadId, message);

        return { threadId, message, thread };
    }

    static async listThreadsForUser(userId, options = {}) {
        const { limit = 50 } = options;
        const query = firestore
            .collection(COLLECTION_THREADS)
            .where('participants', 'array-contains', String(userId))
            .orderBy('updatedAt', 'desc')
            .limit(limit);

        const snapshot = await query.get();
        return snapshot.docs.map(doc => this.serializeThread(doc));
    }

    static async getThread(threadId, userId) {
        const threadRef = this.getThreadRef(threadId);
        const threadSnap = await threadRef.get();

        if (!threadSnap.exists) {
            return null;
        }

        const data = threadSnap.data();
        if (!data.participants || !data.participants.includes(String(userId))) {
            return null;
        }

        return this.serializeThread(threadSnap);
    }

    static async getMessagesForThread(threadId, { limit = 50, order = 'asc', startAfter } = {}) {
        const threadRef = this.getThreadRef(threadId);
        let query = threadRef.collection('messages').orderBy('createdAt', order === 'asc' ? 'asc' : 'desc');

        if (startAfter) {
            query = query.startAfter(startAfter);
        }

        query = query.limit(limit);

        const snapshot = await query.get();
        const messages = snapshot.docs.map(doc => this.serializeMessage(doc));

        return order === 'asc' ? messages : messages.reverse();
    }

    static async markMessagesAsRead(threadId, userId, messageIds = []) {
        const threadRef = this.getThreadRef(threadId);
        const batch = firestore.batch();

        if (messageIds.length) {
            messageIds.forEach((messageId) => {
                const messageRef = threadRef.collection('messages').doc(messageId);
                batch.update(messageRef, {
                    readBy: FieldValue.arrayUnion(String(userId))
                });
            });
        } else {
            const snapshot = await threadRef
                .collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();

            snapshot.docs.forEach((doc) => {
                const data = doc.data() || {};
                const readBy = data.readBy || [];
                if (!readBy.includes(String(userId))) {
                    batch.update(doc.ref, {
                        readBy: FieldValue.arrayUnion(String(userId))
                    });
                }
            });
        }

        batch.update(threadRef, {
            [`unreadCount.${String(userId)}`]: 0
        });

        await batch.commit();

        const threadSnap = await threadRef.get();
        return this.serializeThread(threadSnap);
    }
}

module.exports = MessageService;
