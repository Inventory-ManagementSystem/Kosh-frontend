const GET_INVITES_API_URL = import.meta.env.VITE_GET_INVITES_API_URL;

export const getInvites = async (accessToken) => {
  const response = await fetch(GET_INVITES_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch invites");
  }
  return data;
};
