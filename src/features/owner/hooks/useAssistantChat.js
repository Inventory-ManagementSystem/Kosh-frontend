import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  sendAssistantMessage,
  deleteAssistantConversation,
} from "../api/assistantApi";

const STORAGE_KEY = "kosh-ai-chat";

function getSavedChat() {
  try {
    const savedChat = sessionStorage.getItem(STORAGE_KEY);
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
  return {
    messages: [],
    conversationId: null,
  };
}

function useAssistantChat() {
  const { accessToken } = useAuth();
  const [initialChat] = useState(getSavedChat);
  const [messages, setMessages] = useState(initialChat.messages);
  const [conversationId, setConversationId] = useState(
    initialChat.conversationId,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages,
          conversationId,
        }),
      );
    } catch (error) {
      console.error("Could not save chat:", error);
    }
  }, [messages, conversationId]);

  async function sendMessage(message, attachment = null) {
    if (loading) {
    return;
  }
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !attachment) {
      return;
    }
    if (trimmedMessage.length > 2000) {
    setError("Message cannot exceed 2000 characters.");
    return;
  }
    setError("");
    setLoading(true);
    const userMessage = {
  role: "user",
  content: message,
  attachment: attachment
    ? {
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
      }
    : null,
};
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage
    ]);
    try {
      const response = await sendAssistantMessage(
        trimmedMessage,
        accessToken,
        conversationId,
        attachment
      );
      const data = response.data;
      setConversationId(data.conversation_id);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function startNewChat() {
    if (loading) {
      return;
    }
    setError("");
    try {
      await deleteAssistantConversation(conversationId, accessToken);
      setMessages([]);
      setConversationId(null);
    } catch (error) {
      setError(error.message || "Could not delete the conversation");
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
