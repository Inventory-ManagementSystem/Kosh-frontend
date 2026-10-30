const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getNotifications = async (accessToken) => {
  const response = await fetch(`${BASE_URL}notifications/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch alerts");
  }
  return data.data.results;
};

export const getUnreadCount = async (accessToken) => {
  const response = await fetch(`${BASE_URL}notifications/unread-count/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch unread notifications count.",
    );
  }
  return data.data.unread;
};

export const markNotificationAsRead = async (accessToken, id) => {
  const response = await fetch(`${BASE_URL}notifications/${id}/read/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to mark notification as read.");
  }
  return data.data;
};

export const deleteNotification = async (accessToken, id) => {
  const response = await fetch(`${BASE_URL}notifications/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete notification.");
  }
  return data;
};

export const deleteAllNotifications = async (accessToken, id) => {
  const response = await fetch(`${BASE_URL}notifications/delete-all/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete all notification.");
  }
  return data.data;
};

export const getWsTicket = async (accessToken) => {
  const response = await fetch(`${BASE_URL}notifications/ws-ticket/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to get WebSocket ticket.");
  }
  return data.data.ticket;
};

export const markAllNotificationsAsRead = async (accessToken) => {
  const response = await fetch(`${BASE_URL}notifications/read-all/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || "Failed to mark all notifications as read.",
    );
  }
  return data.data;
};
