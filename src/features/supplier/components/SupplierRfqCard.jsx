import { GrContract, GrExpand } from "react-icons/gr";
import { FiX } from "react-icons/fi";

function SupplierRfqCard({
  rfq,
  details,
  isExpand,
  onToggle,
  onDecline,
  declining,
  canDecline,
  detailsLoading,
  detailsError,
  onCardClick
}) {
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const summary = [
    {
      label: "Category",
      value: details.supply_category,
    },
    {
      label: "Deadline",
      value: formatDate(details.deadline),
    },
    {
      label: "Total Items",
      value: details.item_count,
    },
    {
      label: "Total Quantities",
      value: details.total_quantity,
    },
  ];
  const items = details?.items || [];

  const handleCardKeyDown = (event) => {
  if (event.target !== event.currentTarget) {
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (onCardClick) {
      onCardClick(rfq);
    } else {
      onToggle(rfq);
    }
  }
};

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (onCardClick) {
          onCardClick(rfq);
        } else {
          onToggle(rfq);
        }
      }}
      onKeyDown={handleCardKeyDown}
      className="w-full cursor-pointer rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-4 sm:px-5 sm:py-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              rfq.my_status?.toLowerCase() === "declined"
                ? "bg-(--error-color)"
                : "bg-green-400"
            }`}
          />

          <h2 className="truncate text-base font-semibold text-(--accent-color)">
            {rfq.number || `RFQ #${rfq.rfq_id || rfq.id}`}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(rfq);
            }}
            aria-label={isExpand ? "Collapse RFQ" : "Expand RFQ"}
            aria-expanded={isExpand}
            className="flex h-7 w-7 items-center justify-center rounded text-(--secondary-text-color) transition hover:text-(--accent-color)"
          >
            {isExpand ? <GrContract size={14} /> : <GrExpand size={14} />}
          </button>

          {canDecline && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDecline(rfq);
              }}
              disabled={declining}
              aria-label="Decline RFQ"
              title="Decline RFQ"
              className="flex h-7 w-7 items-center justify-center rounded text-(--secondary-text-color) transition hover:text-(--error-color) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {declining ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-(--secondary-text-color) border-t-transparent" />
              ) : (
                <FiX size={17} />
              )}
            </button>
          )}
        </div>
      </div>

      {!isExpand && (
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="mb-1.5 text-xs font-medium text-(--secondary-text-color)">
                {item.label}
              </p>

              <p className="break-words text-[14px] font-medium text-(--text-color)">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {isExpand && (
        <div className="mt-5 grid grid-cols-1 items-start gap-5 border-t border-(--border-color) pt-5 lg:grid-cols-[2fr_240px]">
          <div className="min-w-0">
            {detailsLoading ? (
              <p className="py-6 text-sm text-(--secondary-text-color)">
                Loading RFQ details...
              </p>
            ) : detailsError ? (
              <div
                className="py-4"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-sm text-(--error-color)">{detailsError}</p>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRetry(rfq.id);
                  }}
                  className="mt-3 rounded-lg border border-(--border-color) px-3 py-2 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="w-full max-w-2xl overflow-x-auto">
                <table className="w-full min-w-[320px] table-fixed text-left">
                  <thead>
                    <tr className="bg-(--input-background)">
                      <th className="w-[46%] rounded-l-full px-3 py-2 text-xs font-medium text-(--secondary-text-color)">
                        PRODUCT
                      </th>

                      <th className="w-[24%] px-2 py-2 text-center text-xs font-medium text-(--secondary-text-color)">
                        QUANTITY
                      </th>

                      <th className="w-[30%] rounded-r-full px-2 py-2 text-center text-xs font-medium text-(--secondary-text-color)">
                        SKU
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id}>
                          <td className="break-words px-3 py-2 text-xs font-semibold text-(--text-color)">
                            {item.product_name}
                          </td>

                          <td className="px-2 py-2 text-center text-xs font-semibold text-(--text-color)">
                            {item.quantity}
                          </td>

                          <td className="break-words px-2 py-2 text-center text-xs font-semibold text-(--text-color)">
                            {item.sku || "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-5 text-center text-sm text-(--secondary-text-color)"
                        >
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {details.notes && (
                  <div className="mt-5">
                    <p className="mb-1.5 text-xs font-medium text-(--secondary-text-color)">
                      NOTES
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm text-(--text-color)">
                      {details.notes}
                    </p>
                  </div>
                )}

                {rfq.my_status?.toLowerCase() === "declined" && (
                  <p className="mt-4 text-sm text-(--error-color)">
                    You have declined this RFQ.
                  </p>
                )}
              </div>
            )}
          </div>

          {!detailsLoading && !detailsError && (
            <div className="h-fit rounded-lg border border-(--border-color) bg-(--input-background) px-3">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 border-b border-(--border-color) py-3 last:border-b-0"
                >
                  <p className="text-xs text-(--secondary-text-color)">
                    {item.label}
                  </p>

                  <p className="text-right text-xs font-semibold text-(--accent-color)">
                    {item.value}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between gap-2 border-t border-(--border-color) py-3">
                <p className="text-xs text-(--secondary-text-color)">Status</p>

                <p
                  className={`text-right text-xs font-semibold ${
                    rfq.my_status?.toLowerCase() === "declined"
                      ? "text-(--error-color)"
                      : "text-(--accent-color)"
                  }`}
                >
                  {(rfq.my_status || "sent")
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SupplierRfqCard;
