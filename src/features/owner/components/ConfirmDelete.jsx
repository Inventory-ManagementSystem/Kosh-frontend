import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { RiDeleteBin6Fill } from "react-icons/ri";

function ConfirmDeleteModal({
  isOpen,
  itemType = "item",
  itemName = "",
  description,
  onCancel,
  onConfirm,
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const title = `Confirm delete ${itemType}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--card-background) p-4 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        className="relative w-full max-w-[565px] rounded-[20px] border border-(--accent-color) bg-(--card-background) px-6 py-10 text-(--text-color) shadow-2xl sm:px-10"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-md p-1 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiX size={22} />
        </button>

        <div className="flex flex-col items-center">
          <div className="mb-9 flex h-[90px] w-[90px] items-center justify-center rounded-full bg-(--error-color)">
            <RiDeleteBin6Fill size={34} className="text-white" />
          </div>

          <h2
            id="confirm-delete-title"
            className="text-center text-xl font-semibold sm:text-2xl"
          >
            {title}
          </h2>

          {description ? (
            <p className="mt-3 max-w-md text-center text-base font-bold">
              {description}
            </p>
          ) : itemName ? (
            <p className="mt-3 max-w-md text-center text-sm text-(--secondary-text-color)">
              Are you sure you want to delete{" "}
              <span className="font-medium text-(--text-color)">
                {itemName}
              </span>
              ?
            </p>
          ) : null}

          <div className="mt-9 flex w-full max-w-[292px] gap-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex h-[39px] flex-1 items-center justify-center rounded-xl border border-(--accent-color) text-sm font-medium transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-50"
            >
              No
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex h-[39px] flex-1 items-center justify-center rounded-xl bg-(--text-color) text-sm font-semibold text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting" : "Yes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
