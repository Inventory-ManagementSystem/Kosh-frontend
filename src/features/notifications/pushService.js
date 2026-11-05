import { deleteToken, getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../../config/firebase";
import {
  getPushConfig,
  registerPushToken,
  unregisterPushToken,
} from "./api/pushNotificationApi";

const TOKEN_KEY = "fcmToken";
let messagingInstance = null;

export async function enablePush(accessToken) {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const { data } = await getPushConfig(accessToken);
  const { firebase, vapid_key } = data;

  const messaging = await getFirebaseMessaging(firebase);
  if (!messaging) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  messagingInstance = messaging;

  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${new URLSearchParams(firebase)}`,
  );
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: vapid_key,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Could not get a push token.");

  await registerPushToken(token, accessToken);
  localStorage.setItem(TOKEN_KEY, token);
  return messaging;
}

export async function disablePush(accessToken) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  try {
    await unregisterPushToken(token, accessToken);
    if (messagingInstance) await deleteToken(messagingInstance);
  } catch (error) {
    console.log("Push disable failed", error.message);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}
