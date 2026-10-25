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
  const restored = useRef(false);

  useEffect(() => {
    if (!accessToken || !initialChat.conversationId || restored.current) {
      return;
    }
    restored.current = true;
    const restoreChat = async () => {
      try {
        const response = await getAssistantConversation(
          initialChat.conversationId,
          accessToken,
        );
        const savedMessages = (response.data?.messages ?? []).map(
          (message) => ({
            role: message.role,
            content: message.content,
          }),
        );
        setMessages(savedMessages);
      } catch (error) {
        console.error("Could not restore chat:", error);
        setMessages([]);
        setConversationId(null);
      }
    };
    restoreChat();
  }, [accessToken, initialChat]);

  async function sendMessage(message) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading || !accessToken) {
      return;
    }
    setError("");
    setLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: trimmedMessage },
    ]);
    try {
      const response = await sendAssistantMessage(
        trimmedMessage,
        accessToken,
        conversationId,
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
