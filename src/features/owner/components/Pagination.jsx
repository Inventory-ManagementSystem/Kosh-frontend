import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const buttonClass =
    "rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-(--border-color) px-4 py-3">
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={page === 1}
        aria-label="First page"
        className={buttonClass}
      >
        <FiChevronsLeft size={16} />
      </button>

      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={buttonClass}
      >
        <FiChevronLeft size={16} />
      </button>

      {getPages().map((pageNumber, index) =>
        pageNumber === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-(--secondary-color)"
          >
            ...
          </span>
        ) : (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onChange(pageNumber)}
            aria-current={page === pageNumber ? "page" : undefined}
            className={`min-w-9 rounded-lg border px-3 py-2 text-sm transition ${
              page === pageNumber
                ? "border-(--accent-color) bg-(--accent-color) text-(--page-background)"
                : "border-(--border-color) text-(--text-color) hover:bg-(--input-background)"
            }`}
          >
            {pageNumber}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={buttonClass}
      >
        <FiChevronRight size={16} />
      </button>

      <button
        type="button"
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
        className={buttonClass}
      >
        <FiChevronsRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
