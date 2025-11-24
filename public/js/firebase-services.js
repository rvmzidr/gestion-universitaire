import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getMessaging, isSupported as messagingSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';
import { getAnalytics, isSupported as analyticsSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

const firebaseConfig = {
    apiKey: 'AIzaSyC34ebIYQfdvY9aPjG34mz2p6L101hxOvc',
    authDomain: 'gestion-universitaire-28077.firebaseapp.com',
    projectId: 'gestion-universitaire-28077',
    storageBucket: 'gestion-universitaire-28077.firebasestorage.app',
    messagingSenderId: '263641868050',
    appId: '1:263641868050:web:64750591a9416da1a6b5cb',
    measurementId: 'G-90YE3E8EV0'
};

let cachedApp = null;
let cachedMessaging = null;

export function initFirebaseApp() {
    if (cachedApp) {
        return cachedApp;
    }

    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return cachedApp;
}

export function getFirebaseAuth() {
    return getAuth(initFirebaseApp());
}

export function getFirebaseFirestore() {
    return getFirestore(initFirebaseApp());
}

export async function getFirebaseMessaging() {
    if (cachedMessaging) {
        return cachedMessaging;
    }

    const supported = await messagingSupported();
    if (!supported) {
        return null;
    }

    cachedMessaging = getMessaging(initFirebaseApp());
    return cachedMessaging;
}

export async function initFirebaseAnalytics() {
    try {
        const supported = await analyticsSupported();
        if (!supported) {
            return null;
        }
        return getAnalytics(initFirebaseApp());
    } catch (error) {
        // Analytics n'est pas critique, on ignore les erreurs (en particulier hors HTTPS)
        return null;
    }
}

export function exposeFirebaseHelpersOnWindow(target = window) {
    const app = initFirebaseApp();
    target.firebaseApp = app;
    target.firebaseServices = {
        getAuth: getFirebaseAuth,
        getFirestore: getFirebaseFirestore,
        getMessaging: getFirebaseMessaging,
        initAnalytics: initFirebaseAnalytics
    };
    return app;
}
