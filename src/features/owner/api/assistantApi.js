const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function sendAssistantMessage(
  message,
  accessToken,
  conversationId,
  attachment,
) {
  let body;
  let headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (attachment) {
    body = new FormData();
    if (message.trim()) {
      body.append("message", message.trim());
    }
    body.append("attachment", attachment);
    if (conversationId) {
      body.append("conversation_id", conversationId);
    }
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({
      message: message.trim(),
      ...(conversationId && {
        conversation_id: conversationId,
      }),
    });
  }
  const response = await fetch(`${BASE_URL}assistant/chat/`, {
    method: "POST",
    headers,
    credentials: "include",
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.message ||
        data.detail ||
        "Failed to send message.",
    );
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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete conversation.");
  }
}


