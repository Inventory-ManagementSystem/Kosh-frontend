import { useEffect, useRef, useState } from "react";
import { BiSolidUserCircle } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import { FiPaperclip, FiX } from "react-icons/fi";

import useAssistantChat from "../../owner/hooks/useAssistantChat";
import formatAssistantMessage from "../../owner/components/formatAssistantMessage";
import NewChatModal from "../../owner/components/NewChatModal";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function EmployeeKoshAI({ dashboardName }) {
  const { messages, loading, error, sendMessage,startNewChat } = useAssistantChat("employee");
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState("");
  const [checkingFile, setCheckingFile] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0 || !messagesEndRef.current) {
      return;
    }
    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  async function handleCreateNewChat() {
  if (deletingChat || loading) {
    return;
  }
  setDeletingChat(true);
  try {
    const success = await startNewChat();
    if (success) {
      setInput("");
      setAttachment(null);
      setFileError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowNewChatModal(false);
    }
  } finally {
    setDeletingChat(false);
  }
}

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setFileError("");
    setAttachment(null);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setFileError("Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.");
      return;
    }
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setFileError("Images cannot exceed 5 MB.");
      return;
    }
    if (isPdf && file.size > MAX_PDF_SIZE) {
      setFileError("PDF files cannot exceed 10 MB.");
      return;
    }
    if (file.size === 0) {
      setFileError("The selected file is empty.");
      return;
    }
    setAttachment(file);
  }

  function handleRemoveFile() {
    setAttachment(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSendMessage(event) {
  event.preventDefault();
  const message = input.trim();
  if (!message && !attachment) {
    return;
  }
  if (loading || checkingFile) {
    return;
  }
  const sentMessage = message;
  const sentAttachment = attachment;
  setInput("");
  setAttachment(null);
  setFileError("");
  const sent = await sendMessage(sentMessage, sentAttachment);
  if (!sent) {
    setInput("");
    setAttachment("");
  }
}

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
      <h1 className="mb-3 shrink-0 text-base font-semibold text-(--accent-color) sm:text-2xl">
        Ask Kosh AI
      </h1>
      <div className="py-2">
      <button
    type="button"
    onClick={() => setShowNewChatModal(true)}
    disabled={loading || deletingChat}
    className="ml-auto flex shrink-0 justify-end items-center gap-2 rounded-lg border border-(--border-color) bg-(--accent-color) px-3 py-2 text-sm font-medium text-(--page-background)"
  >
    New Chat
  </button>
  </div>
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
                    {message.role === "assistant" ? (
  formatAssistantMessage(message.content)
) : (
  <>
    {message.content && <p>{message.content}</p>}

    {message.attachment && (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-current/20 px-2 py-2">
        <FiPaperclip className="shrink-0" />

        <div className="min-w-0">
          <p className="break-all text-xs font-medium">
            {message.attachment.name}
          </p>

          <p className="text-xs opacity-70">
            {(message.attachment.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      </div>
    )}
  </>
)}
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

          {(error || fileError) && (
            <p
              role="alert"
              className="shrink-0 px-4 pb-2 text-sm text-(--error-color)"
            >
              {fileError || error}
            </p>
          )}

          <form
            onSubmit={handleSendMessage}
            className="shrink-0 px-3 pb-3 sm:px-4"
          >
            {attachment && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--input-background) px-3 py-2">
                <FiPaperclip className="shrink-0 text-(--accent-color)" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-(--text-color)">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-(--secondary-text-color)">
                    {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading || checkingFile}
                  aria-label="Remove attachment"
                  className="shrink-0 rounded-full p-1 text-(--secondary-text-color) hover:text-(--text-color) disabled:opacity-50"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-full border border-(--icon-border-color) px-3 py-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                disabled={loading || checkingFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || checkingFile || !!attachment}
                aria-label="Attach a file"
                title="Attach an image or PDF"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-(--secondary-text-color) hover:bg-(--input-background) hover:text-(--text-color) disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPaperclip size={18} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setFileError("");
                }}
                placeholder="Ask anything..."
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={loading || checkingFile}
                className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-(--text-color) outline-none placeholder:text-(--secondary-text-color) disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  (!input.trim() && !attachment) ||
                  loading ||
                  checkingFile
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--accent-color) text-(--page-background) hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
      <NewChatModal
  isOpen={showNewChatModal}
  onClose={() => setShowNewChatModal(false)}
  onConfirm={handleCreateNewChat}
  loading={deletingChat}
/>
    </div>
  );
}

export default EmployeeKoshAI;
