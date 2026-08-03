import type { FirebaseApp } from "firebase/app";

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let appPromise: Promise<FirebaseApp | null> | null = null;

export async function getFirebaseApp(config: FirebaseClientConfig) {
  if (typeof window === "undefined") return null;
  if (!appPromise) {
    appPromise = import("firebase/app").then(({ getApps, initializeApp }) => {
      const existing = getApps()[0];
      return existing ?? initializeApp(config);
    });
  }
  return appPromise;
}

export async function registerFirebaseServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
}

export async function requestFcmToken(input: {
  config: FirebaseClientConfig;
  vapidKey: string;
}) {
  const app = await getFirebaseApp(input.config);
  if (!app) return null;

  const registration = await registerFirebaseServiceWorker();
  if (!registration) return null;

  const { getMessaging, getToken, isSupported } = await import(
    "firebase/messaging"
  );

  if (!(await isSupported())) return null;

  const messaging = getMessaging(app);
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  return getToken(messaging, {
    vapidKey: input.vapidKey,
    serviceWorkerRegistration: registration,
  });
}

export async function listenForForegroundMessages(
  config: FirebaseClientConfig,
  onMessageReceived: (payload: {
    title?: string;
    body?: string;
  }) => void,
) {
  const app = await getFirebaseApp(config);
  if (!app) return () => {};

  const { getMessaging, onMessage, isSupported } = await import(
    "firebase/messaging"
  );

  if (!(await isSupported())) return () => {};

  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    onMessageReceived({
      title: payload.notification?.title,
      body: payload.notification?.body,
    });
  });
}
