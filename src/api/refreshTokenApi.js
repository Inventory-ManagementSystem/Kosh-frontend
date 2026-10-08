const REFRESH_API_URL = import.meta.env.VITE_REFRESH_API_URL;

export const refreshAccessToken = async () => {
  const response = await fetch(REFRESH_API_URL, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Session expired");
  }
  return data.data.access;
};
