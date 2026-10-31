import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getSupplierQuotations } from "../api/supplierRfqApi";
import Pagination from "../../owner/components/Pagination";

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
          className={`flex items-center justify-center shrink-0  w-24 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
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
            <QuotationCard key={quotation.id} quotation={quotation} />
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
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

export default AllQuotations;
