/* global importScripts, firebase */
importScripts(
  "https://www.gstatic.com/firebasejs/13.2.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/13.2.0/firebase-messaging-compat.js",
);
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

function getTargetUrl(notification) {
  const data = notification.data || {};
  const fcm = data.FCM_MSG || {};
  const raw =
    data.url ||
    fcm.data?.url ||
    fcm.notification?.click_action ||
    fcm.fcmOptions?.link ||
    "/";
  return new URL(raw, self.location.origin).href;
}

self.addEventListener("notificationclick", (event) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const target = getTargetUrl(event.notification);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (new URL(client.url).origin === self.location.origin) {
            if ("navigate" in client) client.navigate(target);
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
const params = new URL(self.location.href).searchParams;
const config = {
  apiKey: params.get("apiKey"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};
if (
  config.apiKey &&
  config.projectId &&
  config.messagingSenderId &&
  config.appId
) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    if (payload.notification) return;
    const { title, body, url } = payload.data || {};
    self.registration.showNotification(title || "Notification", {
      body: body || "",
      icon: "/favicon.svg",
      data: { url: url || "/" },
    });
  });
}
