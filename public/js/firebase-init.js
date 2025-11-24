import { exposeFirebaseHelpersOnWindow, initFirebaseAnalytics } from './firebase-services.js';

const app = exposeFirebaseHelpersOnWindow(window);

initFirebaseAnalytics()
    .catch(() => {
        // Ignorer les erreurs d'analytics (souvent dues au manque de HTTPS ou de service worker)
    });

export default app;
