import { useEffect, useRef, useState } from "react";
import { BiSolidUserCircle } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";

import useAssistantChat from "../hooks/useAssistantChat";
import formatAssistantMessage from "../components/formatAssistantMessage";

function KoshAI() {
  const { messages, loading, error, sendMessage } = useAssistantChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0 || !messagesEndRef.current) {
      return;
    }
    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  async function handleSendMessage(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) {
      return;
    }
    setInput("");
    await sendMessage(message);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
      <h1 className="mb-3 shrink-0 text-base font-semibold text-(--accent-color) sm:text-2xl">
        Ask Kosh AI
      </h1>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--card-background)">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <img
                  src="/favicon.svg"
                  alt="Kosh AI"
                  className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16"
                />

                <div>
                  <p className="font-['Google_Sans_Flex'] mb-1 text-xs text-(--secondary-text-color) sm:text-sm">
                    Welcome to Kosh AI,
                  </p>
                  <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold text-(--text-color) sm:text-2xl">
                    How may I help you?
                  </h2>
                </div>
              </div>
            </div>
          ) : (
            <div className="kosh-chat-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <img
                      src="/favicon.svg"
                      alt="Kosh AI"
                      className="mt-1 h-4 w-4 shrink-0 object-contain"
                    />
                  )}

                  <div
                    className={`min-w-0 max-w-[85%] wrap-break-word rounded-xl px-3 py-2 text-sm sm:max-w-[70%] ${
                      message.role === "user"
                        ? "whitespace-pre-wrap bg-(--chat-ai-user-background) text-(--page-background)"
                        : "bg-(--chat-ai-background) text-(--text-color)"
                    }`}
                  >
                    {message.role === "assistant"
                      ? formatAssistantMessage(message.content)
                      : message.content}
                  </div>

                  {message.role === "user" && (
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-(--accent-color)">
                      <BiSolidUserCircle size={30} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2">
                  <img
                    src="/favicon.svg"
                    alt="Kosh AI"
                    className="h-4 w-4 shrink-0 object-contain"
                  />

                  <div className="rounded-xl bg-(--input-background) px-3 py-2 text-sm text-(--secondary-text-color)">
                    Kosh AI is thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="shrink-0 px-4 pb-2 text-sm text-(--error-color)"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSendMessage}
            className="shrink-0 px-3 pb-3 sm:px-4"
          >
            <div className="flex items-center gap-2 rounded-full border border-(--icon-border-color) px-3 py-1.5">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Anything..."
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--accent-color) text-(--page-background) hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default KoshAI;
