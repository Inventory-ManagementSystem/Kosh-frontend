import { GrContract, GrExpand } from "react-icons/gr";
import { FiX } from "react-icons/fi";

function RfqCard({
  rfq,
  details,
  isExpand,
  onToggle,
  onCancel,
  cancelling,
  detailsLoading,
  detailsError,
  onRetry,
}) {
  const summary = [
    { label: "Category", value: details.category || "—" },
    {
      label: "Expected Delivery",
      value: details.expected_delivery || "—",
    },
    { label: "Total Items", value: details.item_count ?? 0 },
    { label: "Total Quantities", value: details.total_quantity ?? 0 },
  ];

  const items = details.items || [];

  return (
    <div className="w-full rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-4 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />

          <h2 className="text-base font-semibold text-(--accent-color)">
            {rfq.number}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-label={isExpand ? "Collapse RFQ" : "Expand RFQ"}
            aria-expanded={isExpand}
            className="flex h-7 w-7 items-center justify-center rounded text-(--secondary-text-color) transition hover:text-(--accent-color)"
          >
            {isExpand ? (
              <GrContract size={14} />
            ) : (
              <GrExpand size={14} />
            )}
          </button>

          {rfq.status === "open" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              aria-label="Cancel RFQ"
              title="Cancel RFQ"
              className="flex h-7 w-7 items-center justify-center rounded text-(--secondary-text-color) transition hover:text-(--error-color) disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiX size={17} />
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
              <p className="break-words text-base font-medium text-(--text-color)">
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
              <div className="py-4">
                <p className="text-sm text-(--error-color)">
                  {detailsError}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
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
                            {item.sku}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RfqCard;
