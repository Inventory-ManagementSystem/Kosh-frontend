import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getInvoices } from "../api/procurementApi";

function AllInvoices() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 10;

  const fetchInvoices = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);

    try {
      const data = await getInvoices(accessToken, page, PAGE_SIZE);

      setInvoices(data.results || []);
      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / PAGE_SIZE)));
    } catch (error) {
      toast.error(error.message || "Unable to load invoices.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleInvoiceClick = (invoice) => {
    navigate(`/owner/invoices/${invoice.id}`);
  };

  const formatCurrency = (amount) =>
    `\u20B9${(Number(amount) || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function Pagination() {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-(--border-color) px-4 py-3">
        <button
          type="button"
          onClick={() => setPage(1)}
          disabled={page === 1}
          aria-label="First page"
          className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronsLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => setPage((current) => current - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft size={16} />
        </button>

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            aria-current={page === pageNumber ? "page" : undefined}
            className={`min-w-9 rounded-lg border px-3 py-2 text-sm transition ${
              page === pageNumber
                ? "border-(--accent-color) bg-(--accent-color) text-[#00010f]"
                : "border-(--border-color) text-(--text-color) hover:bg-(--input-background)"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight size={16} />
        </button>

        <button
          type="button"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
          className="rounded-lg border border-(--border-color) p-2 text-(--text-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronsRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 p-4 text-(--accent-color) sm:p-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Invoices</h1>

      <div className="overflow-hidden rounded-lg bg-(--card-background)">
        {loading ? (
          <div className="divide-y divide-(--border-color)">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-3 px-4 py-5"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-(--input-background)" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-28 rounded bg-(--input-background)" />
                  <div className="h-3 w-44 max-w-full rounded bg-(--input-background)" />
                </div>

                <div className="space-y-2">
                  <div className="ml-auto h-3 w-20 rounded bg-(--input-background)" />
                  <div className="ml-auto h-3 w-14 rounded bg-(--input-background)" />
                </div>
              </div>
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div className="divide-y divide-(--border-color)">
            {invoices.map((invoice) => (
              <button
                key={invoice.id}
                type="button"
                onClick={() => handleInvoiceClick(invoice)}
                className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition hover:bg-(--input-background) sm:px-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--input-background) text-(--accent-color)">
                  <FiFileText size={19} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-(--text-color)">
                    {invoice.number}
                  </span>

                  <span className="mt-1 block text-xs text-(--secondary-text-color)">
                    {invoice.po_number || "—"} ·{" "}
                    {invoice.company_name || invoice.business_name || "—"}
                  </span>

                  <span className="mt-1 block text-xs text-(--secondary-text-color)">
                    {formatDate(invoice.issue_date)} · {invoice.item_count}{" "}
                    {invoice.item_count === 1 ? "item" : "items"}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold text-(--text-color)">
                    {formatCurrency(invoice.grand_total)}
                  </span>

                  <span
                    className={`mt-1 inline-block text-xs capitalize ${
                      invoice.status === "paid"
                        ? "text-[#5fba71]"
                        : "text-[#ff985c]"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </span>

                <FiChevronRight
                  className="shrink-0 text-(--secondary-text-color)"
                  size={18}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-14 text-center">
            <FiFileText
              className="mx-auto mb-3 text-(--secondary-text-color)"
              size={30}
            />
            <p className="text-sm font-medium text-(--text-color)">
              No invoices found
            </p>
            <p className="mt-1 text-xs text-(--secondary-text-color)">
              Invoices will appear here when suppliers dispatch orders.
            </p>
          </div>
        )}

        {!loading && invoices.length > 0 && <Pagination />}
      </div>
    </div>
  );
}

export default AllInvoices;
