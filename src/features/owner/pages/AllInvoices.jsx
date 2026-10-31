import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getInvoices } from "../api/procurementApi";
import Pagination from "../components/Pagination";

function AllInvoices() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 10;

  const fetchInvoices = useCallback(async () => {
    if (!accessToken) {
      setInvoices([]);
      setLoading(false);
      return;
    }
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
                        ? "text-[#18903f]"
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

        {!loading && invoices.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}

export default AllInvoices;
