export async function cancelEmployeeInvite(inviteId, accessToken) {
  const response = await fetch(
    `${import.meta.env.VITE_CANCEL_EMPLOYEE_INVITE_URL}${inviteId}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to cancel invitation");
  }
  return result;
}
