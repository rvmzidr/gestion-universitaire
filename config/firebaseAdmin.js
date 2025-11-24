const admin = require('firebase-admin');

let appInstance = null;

function getFirebaseAdmin() {
    if (appInstance) {
        return admin;
    }

    const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY
    } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error('Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in the environment.');
    }

    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    appInstance = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey
        })
    });

    return admin;
}

module.exports = {
    getFirebaseAdmin
};
