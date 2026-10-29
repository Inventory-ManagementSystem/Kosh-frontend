import { IoChatbubbleEllipses } from "react-icons/io5";

function NewChatModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[5px]"
      onClick={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        className="w-full max-w-md rounded-xl border border-(--border-color) bg-(--card-background) p-5 shadow-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--input-background) text-(--accent-color)">
            <IoChatbubbleEllipses size={22} />
          </div>

          <h2
            id="new-chat-title"
            className="flex text-lg font-semibold text-(--text-color)"
          >
            Create New Chat
          </h2>
        </div>

        <p className="mb-6 text-sm leading-6 text-(--text-color)">
          This clears the current chat. Do you want to create a new one?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-(--border-color) bg-(--accent-color) px-4 py-2 text-sm font-medium text-(--page-background)"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-(--accent-color) px-4 py-2 text-sm font-medium text-(--page-background) transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
