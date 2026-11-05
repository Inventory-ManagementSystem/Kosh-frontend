import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { onMessage } from "firebase/messaging";

import { useAuth } from "../../../context/AuthContext";
import { enablePush } from "../pushService";

export function usePushNotifications() {
  const { accessToken, isAuthenticated } = useAuth();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  const supported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator;

  const [permission, setPermission] = useState(
    supported ? Notification.permission : "denied",
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported || !isAuthenticated || permission !== "granted") return;
    let unsubscribe = () => {};
    let cancelled = false;
    enablePush(tokenRef.current)
      .then((messaging) => {
        if (cancelled) return;
        unsubscribe = onMessage(messaging, (payload) => {
          toast(
            payload.notification?.title ||
              payload.data?.title ||
              "New notification",
          );
        });
      })
      .catch((error) => console.log("Push setup", error.message));

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [supported, isAuthenticated, permission]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      await enablePush(tokenRef.current);
      setPermission(Notification.permission);
      toast.success("Push notifications enabled.");
    } catch (error) {
      setPermission(Notification.permission);
      toast.error(
        error.status === 503
          ? "Push is not configured on the server."
          : error.message,
      );
    } finally {
      setBusy(false);
    }
  }, []);

  return { supported, permission, busy, enable };
}
