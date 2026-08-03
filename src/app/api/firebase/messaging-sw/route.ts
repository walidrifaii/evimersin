import { getNotificationIconUrl } from "@/lib/firebase/notification-icon";
import { getFirebasePublicConfig } from "@/server/services/firebase.service";

export const runtime = "nodejs";

export async function GET() {
  const config = getFirebasePublicConfig();

  if (!config) {
    return new Response("console.warn('Firebase is not configured');", {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const iconUrl = getNotificationIconUrl();

  const body = `
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});
firebase.messaging().onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || "EviMersin";
  const options = {
    body: payload.notification?.body || "New website activity",
    icon: ${JSON.stringify(iconUrl)},
    badge: ${JSON.stringify(iconUrl)},
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow("/dashboard?tab=overview"));
});
`.trim();

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
    },
  });
}
