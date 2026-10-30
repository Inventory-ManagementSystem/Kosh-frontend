import { useEffect, useRef } from "react";
import { getWsTicket } from "../api/notificationApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const MIN_RETRY_DELAY = 3000;
const MAX_RETRY_DELAY = 30000;

const getSocketUrl = (ticket) => {
  const { protocol, host } = new URL(BASE_URL);
  const socketProtocol = protocol === "https:" ? "wss:" : "ws:";
  return `${socketProtocol}//${host}/ws/notifications/?ticket=${encodeURIComponent(ticket)}`;
};

export const useNotificationSocket = (accessToken, onMessage) => {
  const isLoggedIn = Boolean(accessToken);
  const tokenRef = useRef(accessToken);
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    tokenRef.current = accessToken;
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let socket = null;
    let retryTimer = null;
    let retryDelay = MIN_RETRY_DELAY;
    let closedByUs = false;

    const scheduleRetry = () => {
      if (closedByUs) {
        return;
      }
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    };

    const connect = async () => {
      try {
        const ticket = await getWsTicket(tokenRef.current);
        if (closedByUs) {
          return;
        }

        socket = new WebSocket(getSocketUrl(ticket));

        socket.onopen = () => {
          retryDelay = MIN_RETRY_DELAY;
        };

        socket.onmessage = (event) => {
          try {
            onMessageRef.current?.(JSON.parse(event.data));
          } catch (error) {
            console.log("Invalid notification message", error.message);
          }
        };

        socket.onclose = scheduleRetry;
      } catch (error) {
        console.log(error.message || "Failed to connect notifications");
        scheduleRetry();
      }
    };

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [isLoggedIn]);
};
