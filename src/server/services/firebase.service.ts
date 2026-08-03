import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { getNotificationIconUrl } from "@/lib/firebase/notification-icon";
import { getAppBaseUrl } from "@/lib/image-url";

type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (
    !projectId ||
    !apiKey ||
    !authDomain ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseAdminConfigured() {
  return getServiceAccount() !== null;
}

export function isFirebaseClientConfigured() {
  return (
    getFirebasePublicConfig() !== null &&
    Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)
  );
}

let adminApp: App | null = null;
let messagingClient: Messaging | null = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  const account = getServiceAccount();
  if (!account) return null;

  const existing = getApps()[0];
  adminApp =
    existing ??
    initializeApp({
      credential: cert({
        projectId: account.projectId,
        clientEmail: account.clientEmail,
        privateKey: account.privateKey,
      }),
    });

  return adminApp;
}

function getMessagingClient() {
  if (messagingClient) return messagingClient;
  const app = getAdminApp();
  if (!app) return null;
  messagingClient = getMessaging(app);
  return messagingClient;
}

export const firebaseService = {
  isReady: () => isFirebaseAdminConfigured(),

  async sendVisitorNotification(input: {
    path: string;
    locale: string;
    tokens: string[];
  }) {
    const messaging = getMessagingClient();
    if (!messaging || input.tokens.length === 0) return { sent: 0, failed: 0 };

    const localeLabel = input.locale === "ar" ? "Arabic" : "English";
    const page = input.path === "/" ? "Homepage" : input.path;

    const iconUrl = getNotificationIconUrl();
    const dashboardLink = `${getAppBaseUrl()}/dashboard?tab=overview`;

    const result = await messaging.sendEachForMulticast({
      tokens: input.tokens,
      notification: {
        title: "New website visitor",
        body: `A guest opened ${page} (${localeLabel}).`,
        imageUrl: iconUrl,
      },
      webpush: {
        notification: {
          icon: iconUrl,
          badge: iconUrl,
        },
        fcmOptions: {
          link: dashboardLink,
        },
      },
      data: {
        type: "site_visit",
        path: input.path,
        locale: input.locale,
      },
    });

    return {
      sent: result.successCount,
      failed: result.failureCount,
    };
  },
};
