const REFRESH_API_URL = import.meta.env.VITE_REFRESH_API_URL;

let refreshPromise = null;
let onTokenRefresh = null;
let blockedUntil = 0;
let lastRefreshError = null;

export const setOnTokenRefresh = (callback) => {
  onTokenRefresh = callback;
};

export const refreshAccessToken = () => {
  if (Date.now() < blockedUntil) {
    return Promise.reject(lastRefreshError);
  }
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    const response = await fetch(REFRESH_API_URL, {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data.detail || data.message || "Session refresh failed",
      );
      error.status = response.status;
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const waitSeconds =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 31;

        blockedUntil = Date.now() + waitSeconds * 1000;
        lastRefreshError = error;
      }

      throw error;
    }

    const access = data.data?.access;
    if (!access) {
      throw new Error("Access token missing from refresh response");
    }
    blockedUntil = 0;
    lastRefreshError = null;
    if (onTokenRefresh) {
      onTokenRefresh(access);
    }
    return access;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};
