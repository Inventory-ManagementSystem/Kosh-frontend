const BASE_URL = import.meta.env.VITE_BASE_URL;

export const MIN_SEARCH_LENGTH = 3;
export const MAX_SEARCH_LENGTH = 50;

export const searchAll = async (accessToken, query, signal) => {
  const response = await fetch(
    `${BASE_URL}search/?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal,
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to search.");
  }
  return data.data;
};
