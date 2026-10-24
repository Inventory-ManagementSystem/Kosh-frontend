import { useCallback, useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getSupplierQuotations } from "../api/supplierRfqApi";

const PAGE_SIZE = 5;

const statusOptions = [
  { label: "All Quotations", value: "" },
  { label: "Submitted", value: "submitted" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const formatCurrency = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (value) => {
  if (!value) return "—";
  return value.replaceAll("_", " ");
};

const getStatusClass = (status) => {
  if (status === "accepted") {
    return "border-green-400/30 bg-green-400/10 text-green-600";
  }
  if (status === "rejected" || status === "withdrawn") {
    return "border-(--error-color) bg-(--decoration-background) text-(--error-color)";
  }
  return "border-(--border-color) bg-(--input-background) text-(--accent-color)";
};

function QuotationCard({ quotation }) {
  const summary = [
    {
      label: "Order No.",
      value: quotation.order_number || "—",
    },
    {
      label: "Delivery",
      value: formatDate(quotation.delivery_date),
    },
    {
      label: "Stock",
      value: `${Number(quotation.total_quantity || 0).toLocaleString("en-IN")} units`,
    },
    {
      label: "Amount",
      value: formatCurrency(quotation.grand_total),
    },
    {
      label: "Advance Amount",
      value: formatCurrency(quotation.advance_amount),
    },
  ];

  return (
    <div className="w-full rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-4 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
          <h2 className="truncate text-base font-semibold text-(--accent-color)">
            {quotation.rfq_number || "Quotation"}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
            quotation.status,
          )}`}
        >
          {formatStatus(quotation.status)}
        </span>
      </div>

      <div className="mt-2 pl-3.5">
        <p className="text-sm text-(--text-color)">
          {quotation.business_name || "—"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        {summary.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="mb-1.5 text-xs font-medium text-(--secondary-text-color)">
              {item.label}
            </p>
            <p className="break-words text-[14px] font-medium capitalize text-(--text-color)">
              {item.value}
            </p>
            {item.label === "Order No." && !quotation.order_number && (
              <p className="mt-1 text-xs text-(--secondary-text-color)">
                No order generated
              </p>
            )}
            {item.label === "Advance Amount" && quotation.advance_status && (
              <p className="mt-1 text-xs capitalize text-(--secondary-text-color)">
                {formatStatus(quotation.advance_status)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AllQuotations() {
  const { accessToken } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchQuotations = useCallback(async () => {
    if (!accessToken) {
      setQuotations([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getSupplierQuotations(
        accessToken,
        page,
        PAGE_SIZE,
        "",
        status,
      );

      setQuotations(data?.results || []);
      setTotalCount(Number(data?.count) || 0);
    } catch (error) {
      toast.error(error.message || "Failed to load quotations.");
      setQuotations([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, status]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-['Google_Sans_Flex'] text-xl font-semibold text-(--accent-color) sm:text-2xl">
            Quotation Status
          </h1>
        </div>

        <select
          value={status}
          onChange={handleStatusChange}
          className="rounded-lg border border-(--border-color) bg-(--dropdown-background) px-3 py-2 text-sm text-(--text-color) outline-none focus:border-(--accent-color)"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-5 sm:px-5"
            >
              <div className="h-4 w-36 rounded bg-(--decoration-background)" />
              <div className="mt-3 h-3 w-48 rounded bg-(--decoration-background)" />

              <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, itemIndex) => (
                  <div key={itemIndex}>
                    <div className="h-3 w-20 rounded bg-(--decoration-background)" />
                    <div className="mt-2 h-4 w-28 rounded bg-(--decoration-background)" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : quotations.length > 0 ? (
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-(--border-color) bg-(--card-background) px-5 py-12 text-center">
          <h3 className="mt-3 font-medium text-(--text-color)">
            No quotations found
          </h3>

          <p className="mt-1 text-sm text-(--secondary-text-color)">
            {status
              ? "No quotations are available for this status."
              : "Your submitted quotations will appear here."}
          </p>
        </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-(--border-color) pt-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(1)}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border-color) text-(--text-color) transition hover:bg-(--decoration-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronsLeft />
            </button>

            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border-color) text-(--text-color) transition hover:bg-(--decoration-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (pageNumber) =>
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - page) <= 1,
              )
              .map((pageNumber, index, pages) => (
                <span key={pageNumber} className="flex items-center gap-1">
                  {index > 0 && pages[index - 1] !== pageNumber - 1 && (
                    <span className="px-1 text-(--secondary-text-color)">
                      ...
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    className={`min-w-9 rounded-lg border px-3 py-2 text-sm transition ${
                      page === pageNumber
                        ? "border-(--accent-color) bg-(--decoration-background) text-(--text-color)"
                        : "border-(--border-color) text-(--secondary-text-color) hover:bg-(--decoration-background)"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </span>
              ))}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border-color) text-(--text-color) transition hover:bg-(--decoration-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight />
            </button>

            <button
              type="button"
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border-color) text-(--text-color) transition hover:bg-(--decoration-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronsRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllQuotations;