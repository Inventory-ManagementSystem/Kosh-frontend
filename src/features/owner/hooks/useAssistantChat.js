import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  sendAssistantMessage,
  deleteAssistantConversation,
} from "../api/assistantApi";

function getSavedChat(storageKey) {
  try {
    const savedChat = sessionStorage.getItem(storageKey);
    if (savedChat) {
      const data = JSON.parse(savedChat);
      return {
        messages: Array.isArray(data.messages) ? data.messages : [],
        conversationId: data.conversationId || null,
      };
    }
  } catch (error) {
    console.error("Could not restore chat:", error);
  }
  return { messages: [], conversationId: null };
}

function useAssistantChat(dashboardName = "default") {
  const { accessToken } = useAuth();
  const storageKey = `kosh-ai-chat-${dashboardName}`;

  const [initialChat] = useState(() => getSavedChat(storageKey));
  const [messages, setMessages] = useState(initialChat.messages);
  const [conversationId, setConversationId] = useState(
    initialChat.conversationId,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ messages, conversationId }),
      );
    } catch (error) {
      console.error("Could not save chat:", error);
    }
  }, [messages, conversationId, storageKey]);

  async function sendMessage(message, attachment = null) {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && !attachment) || loading || !accessToken) {
      return false;
    }
    if (trimmedMessage.length > 2000) {
      setError("Message cannot exceed 2000 characters.");
      return false;
    }

    setError("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedMessage,
        attachment: attachment
          ? {
              name: attachment.name,
              size: attachment.size,
              type: attachment.type,
            }
          : null,
      },
    ]);

    try {
      const response = await sendAssistantMessage(
        trimmedMessage,
        accessToken,
        conversationId,
        attachment,
      );
      const data = response.data;
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      return true;
    } catch (error) {
      setError(error.message || "Something went wrong");
      setMessages((prev) => prev.slice(0, -1));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function startNewChat() {
    if (loading) {
      return false;
    }
    setError("");
    try {
      if (conversationId) {
        await deleteAssistantConversation(conversationId, accessToken);
      }
      setMessages([]);
      setConversationId(null);
      return true;
    } catch (error) {
      setError(error.message || "Could not delete the conversation");
      return false;
    }
  }

  return {
    messages,
    conversationId,
    loading,
    error,
    sendMessage,
    startNewChat,
  };
}

export default useAssistantChat;