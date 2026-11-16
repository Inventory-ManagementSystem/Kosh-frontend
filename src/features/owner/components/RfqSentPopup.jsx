import { useEffect } from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function RfqSentPopup({ supplier, rfqs, onBack, onView }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onBack();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-105 overflow-y-auto rounded-2xl border border-(--border-color) bg-(--page-background) px-6 py-8 text-(--text-color) shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-(--success-color)/40 bg-(--success-background) text-(--success-color)">
          <FiCheck size={24} />
        </div>
        <h2 className="mt-5 text-center text-lg font-bold text-(--accent-color)">
          RFQ sent to {supplier.company_name}
        </h2>
        <p className="mt-1 text-center text-xs text-(--secondary-text-color)">
          They&apos;ve been notified and can quote from their RFQ inbox.
        </p>

        <div className="mt-6 space-y-3">
          {rfqs.map((rfq) => {
            const alertCount = rfq.reorder_suggestion_ids?.length || 0;
            return (
              <div
                key={rfq.id}
                className="rounded-xl border border-(--border-color) bg-(--card-background) p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{rfq.number}</p>
                  <span className="text-[11px] font-semibold capitalize text-(--accent-color)">
                    {rfq.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-(--secondary-text-color)">Category</p>
                    <p className="mt-1 font-bold">{rfq.supply_category}</p>
                  </div>
                  <div>
                    <p className="text-(--secondary-text-color)">Products</p>
                    <p className="mt-1 font-bold">
                      {rfq.item_count} · {rfq.total_quantity} units
                    </p>
                  </div>
                  <div>
                    <p className="text-(--secondary-text-color)">Quotes due</p>
                    <p className="mt-1 font-bold">{formatDate(rfq.deadline)}</p>
                  </div>
                </div>
                {alertCount > 0 && (
                  <p className="mt-3 flex items-start gap-2 border-t border-(--border-color) pt-3 text-[11px] text-(--secondary-text-color)">
                    <FiAlertTriangle className="mt-0.5 shrink-0 text-amber-400" />
                    {alertCount} low-stock alert
                    {alertCount === 1 ? " was" : "s were"} linked to this RFQ,
                    so they won&apos;t create another one.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-12 cursor-pointer rounded-xl border border-(--border-color) text-sm font-semibold transition hover:bg-(--sidebar-hover-background)"
          >
            Back to map
          </button>
          <button
            type="button"
            onClick={onView}
            className="h-12 cursor-pointer rounded-xl bg-(--accent-color) text-sm font-semibold text-(--page-background) transition hover:opacity-90"
          >
            View RFQ
          </button>
        </div>
      </div>
    </div>
  );
}

export default RfqSentPopup;
