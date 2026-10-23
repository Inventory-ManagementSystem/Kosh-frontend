import { refreshAccessToken } from "./refreshTokenApi";

export const apiFetch = async (url, accessToken, options = {}) => {
  const makeRequest = (token) => {
    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
  };
  let response = await makeRequest(accessToken);
  if (response.status !== 401) {
    return response;
  }
  try {
    const newAccessToken = await refreshAccessToken();
    response = await makeRequest(newAccessToken);
    return response;
  } catch (error) {
    if ([400, 401, 403].includes(error.status)) {
      window.location.href = "/login";
    }

    throw error;
  }
};
