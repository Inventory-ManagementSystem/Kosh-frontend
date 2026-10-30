import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
  markAllNotificationsAsRead,
} from "../api/notificationApi";

function NotificationDropdown({ onUnreadCountChange, liveNotification }) {
  const { accessToken } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!liveNotification) return;
    setNotifications((previous) =>
      previous.some((item) => item.id === liveNotification.id)
        ? previous
        : [{ is_read: false, ...liveNotification }, ...previous],
    );
  }, [liveNotification]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const fetchNotifications = async () => {
      try {
        setError("");
        const data = await getNotifications(accessToken);
        setNotifications(data);
      } catch (error) {
        console.log(error.message || "Failed to load notifications");
      }
    };
    fetchNotifications();
    // const interval=setInterval(()=>{
    //     fetchNotifications();
    // },15000);
    return () => {
      // clearInterval(interval);
    };
  }, [accessToken]);

  const refreshUnreadCount = async () => {
    const count = await getUnreadCount(accessToken);
    onUnreadCountChange(count);
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) {
      return;
    }
    try {
      setActionError("");
      const updatedNotifications = await markNotificationAsRead(
        accessToken,
        notification.id,
      );
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, ...updatedNotifications, is_read: true }
            : item,
        ),
      );
      await refreshUnreadCount();
    } catch (error) {
      setActionError(error.message || "Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionError("");
      await deleteNotification(accessToken, id);
      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== id),
      );
      await refreshUnreadCount();
    } catch (error) {
      setActionError(error.message || "Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) {
      return;
    }
    try {
      setActionError("");
      await deleteAllNotifications(accessToken);
      setNotifications([]);
      onUnreadCountChange(0);
    } catch (error) {
      setActionError(error.message || "Failed to clear notifications");
    }
  };

  const hasUnread = notifications.some((item) => !item.is_read);

  const handleMarkAllAsRead = async () => {
    if (!hasUnread) {
      return;
    }
    try {
      setActionError("");
      await markAllNotificationsAsRead(accessToken);
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true })),
      );
      onUnreadCountChange(0);
    } catch (error) {
      setActionError(error.message || "Failed to mark all as read");
    }
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-(--border-color) bg-(--dropdown-background) p-3 shadow-xl">
      <div className="flex items-center justify-between gap-3 pb-3">
        <h2 className="font-['Google_Sans_Flex'] text-base font-semibold text-(--text-color)">
          Notifications
        </h2>
        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={!hasUnread}
          className=" font-['Google_Sans_Flex'] rounded border border-(--border-color) px-2 py-1 text-[12px] text-(--text-color) hover:bg-(--input-background)"
        >
          Mark All Read
        </button>
      </div>
      {error && <p className="mb-2 text-xs text-(--error-color)">{error}</p>}
      {actionError && (
        <p className="mb-2 text-xs text-[--error-color]">{actionError}</p>
      )}

      <div className="max-h-[360px] space-y-2 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-(--secondary-text-color)">
            No notifications
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-2 rounded-xl bg-(--input-background) px-2.5 py-2.5"
            >
              <span
                className={`mt-0.5 mr-1 h-10 w-1 shrink-0 rounded-full ${
                  notification.is_read
                    ? "bg-(--secondary-text-color)"
                    : "bg-teal-300"
                }`}
              />

              <button
                type="button"
                onClick={() => handleMarkAsRead(notification)}
                disabled={notification.is_read}
                className="min-w-0 flex-1 text-left disabled:cursor-default"
              >
                <p
                  className={`text-xs text-(--text-color) ${
                    notification.is_read ? "font-normal" : "font-semibold"
                  }`}
                >
                  {notification.title}
                </p>
                <p className="pt-1 text-[11px] text-(--secondary-text-color)">
                  {notification.body}
                </p>
              </button>

              <button
                type="button"
                title="Delete notification"
                onClick={() => handleDelete(notification.id)}
                className="shrink-0 text-(--secondary-text-color) transition-colors hover:text-(--text-color)"
              >
                <FiX size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
