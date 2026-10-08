import { refreshAccessToken } from "./refreshTokenApi";

let refreshPromise = null;
export const apiFetch = async (url, accessToken, options = {}) => {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status !== 401) {
    return response;
  }
  try {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newAccessToken = await refreshPromise;
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
    return response;
  } catch {
    window.location.href = "/login";
    throw new Error("Session expired");
  } finally {
    refreshPromise = null;
  }
};
