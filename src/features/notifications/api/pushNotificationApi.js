const BASE_URL = import.meta.env.VITE_BASE_URL;

async function request(path, accessToken, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body && { "Content-Type": "application/json" }),
    },
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const getPushConfig = (accessToken) =>
  request("notifications/push/config/", accessToken);

export const registerPushToken = (token, accessToken) =>
  request("notifications/push/register/", accessToken, {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const unregisterPushToken = (token, accessToken) =>
  request("notifications/push/unregister/", accessToken, {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const sendTestPush = (accessToken) =>
  request("notifications/push/test/", accessToken, { method: "POST" });
