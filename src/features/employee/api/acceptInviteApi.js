const ACCEPT_INVITE_API_URL = import.meta.env.VITE_ACCEPT_INVITE_API_URL;

export const acceptInvite = async (inviteId, accessToken) => {
  const response = await fetch(`${ACCEPT_INVITE_API_URL}/${inviteId}/accept/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to accept invite");
  }
  return data;
};
