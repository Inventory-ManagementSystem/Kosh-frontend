const DECLINE_INVITE_API_URL = import.meta.env.VITE_DECLINE_INVITE_API_URL;

export const declineInvite = async (inviteId, accessToken) => {
  const response = await fetch(
    `${DECLINE_INVITE_API_URL}/${inviteId}/decline/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to decline invite");
  }
  return data;
};
