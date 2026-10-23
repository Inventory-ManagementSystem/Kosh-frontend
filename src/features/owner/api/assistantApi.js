const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function sendAssistantMessage(
  message,
  accessToken,
  conversationId,
) {
  const body = {
    message,
  };
  if (conversationId) {
    body.conversation_id = conversationId;
  }
  const response = await fetch(`${BASE_URL}assistant/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to send message.");
  }
  return data;
}

export async function deleteAssistantConversation(conversationId, accessToken) {
  if (!conversationId) {
    return;
  }
  const response = await fetch(
    `${BASE_URL}assistant/conversations/${conversationId}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete conversation.");
  }
}
