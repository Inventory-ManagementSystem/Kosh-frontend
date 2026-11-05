import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

export async function getFirebaseMessaging(config) {
  if (!(await isSupported())) return null;
  const app = getApps()[0] ?? initializeApp(config);
  return getMessaging(app);
}
