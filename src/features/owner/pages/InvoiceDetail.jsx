import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getInvoiceDetails, downloadInvoicePdf } from "../api/procurementApi";
import logo from "../../../assets/auth/logo.svg";

const formatCurrency = (value) =>
  `\u20B9${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-(--secondary-text-color)">{label}</span>
      <span className="min-w-0 break-words text-right text-(--text-color)">
        {value ?? "—"}
      </span>
    </div>
  );
}

function InvoiceDetail() {
  const { invoiceId } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!accessToken || !invoiceId) return;
    setLoading(true);
    try {
      const data = await getInvoiceDetails(accessToken, invoiceId);
      setInvoice(data);
    } catch (error) {
      toast.error(error.message || "Unable to load invoice.");
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (loading) {
    return (
      <div className="min-h-screen space-y-4 p-4 sm:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-(--card-background)" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="h-64 animate-pulse rounded-lg bg-(--card-background)" />
          <div className="h-96 animate-pulse rounded-lg bg-(--card-background)" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen p-6 text-(--text-color)">
        <p>Unable to display this invoice.</p>
        <button
          type="button"
          onClick={() => navigate("/owner/invoices")}
          className="mt-4 rounded-lg border border-(--border-color) px-4 py-2"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const supplier = invoice.supplier || {};
  const buyer = invoice.buyer || {};

  const handleDownloadInvoice = async () => {
    if (!accessToken || !invoiceId || downloading) return;
    setDownloading(true);
    try {
      const blob = await downloadInvoicePdf(accessToken, invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const supplierName =
        invoice.supplier?.company_name || invoice.company_name || "Supplier";
      const fileName = `${invoice.number || "Invoice"}-${supplierName}`
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .trim();
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully.");
    } catch (error) {
      console.error("Invoice download failed:", error);
      toast.error(error.message || "Unable to download invoice.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-5 p-4 text-(--text-color) sm:p-6">
      <h1 className="text-2xl font-semibold text-(--accent-color) sm:text-3xl">
        PO &amp; Invoice
      </h1>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-lg bg-(--card-background) p-4">
          <h2 className="mb-5 text-base font-semibold text-(--accent-color)">
            Invoice Details
          </h2>

          <div className="space-y-4">
            <DetailRow label="Invoice No." value={invoice.number} />
            <DetailRow
              label="Generated on"
              value={formatDate(invoice.issue_date)}
            />
            <DetailRow label="Time" value={formatTime(invoice.created_at)} />
            <DetailRow
              label="Supplier Name"
              value={supplier.company_name || invoice.company_name}
            />
            <DetailRow
              label="Sent to"
              value={buyer.business_name || invoice.business_name}
            />
            <DetailRow label="Order No." value={invoice.po_number} />
            <DetailRow label="Status" value={invoice.status} />

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-(--accent-color) px-4 py-3 text-sm font-semibold text-[#00010f] transition hover:opacity-90"
            >
              {downloading ? "Downloading" : "Download Invoice"}
              <FiDownload size={16} />
            </button>
          </div>
        </section>

        <section className="min-w-0 rounded-lg bg-(--card-background) p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-(--accent-color)">
                Order
              </h2>
              <p className="text-xs text-(--secondary-text-color)">
                #{invoice.po_number || invoice.purchase_order_id}
              </p>
            </div>

            <div className="flex items-center gap-2 text-(--accent-color)">
              <img src={logo} alt="KOSH" className="h-6 w-auto" />
            </div>
          </div>

          <div className="my-5 grid grid-cols-2 gap-5 text-xs">
            <div className="min-w-0 space-y-1">
              <p className="text-(--secondary-text-color)">From</p>
              <p className="font-medium">
                {supplier.company_name || invoice.company_name || "—"}
              </p>
              <p className="break-words text-(--secondary-text-color)">
                {supplier.address || "—"}
              </p>
              <p className="text-(--secondary-text-color)">
                {supplier.city || "—"}
              </p>
              <p className="break-all text-(--secondary-text-color)">
                {supplier.phone || "—"}
              </p>
              <p className="break-all text-(--secondary-text-color)">
                {supplier.email || "—"}
              </p>
              <p className="break-all text-(--secondary-text-color)">
                GSTIN: {supplier.gstin || "—"}
              </p>
            </div>

            <div className="min-w-0 space-y-1 text-right">
              <p className="text-(--secondary-text-color)">To</p>
              <p className="font-medium">
                {buyer.business_name || invoice.business_name || "—"}
              </p>
              <p className="text-(--secondary-text-color)">
                {buyer.owner_name || "—"}
              </p>
              <p className="text-(--secondary-text-color)">
                {buyer.city || "—"}
              </p>
              <p className="break-all text-(--secondary-text-color)">
                {buyer.email || "—"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="bg-(--card-background) text-(--secondary-text-color)">
                  <th className="rounded-l-lg py-3 pl-3 font-medium">
                    Product
                  </th>
                  <th className="px-3 py-3 font-medium">Qty</th>
                  <th className="px-3 py-3 font-medium">Unit Price</th>
                  <th className="px-3 py-3 font-medium">GST</th>
                  <th className="rounded-r-lg py-3 pr-3 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {(invoice.items || []).map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-(--border-color)"
                  >
                    <td className="py-3 pr-3">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="mt-1 text-(--secondary-text-color)">
                        {item.sku || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">{item.quantity}</td>
                    <td className="px-3 py-3">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-3 py-3">{item.gst_rate}%</td>
                    <td className="py-3 pl-3 text-right">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <p className="text-(--secondary-text-color)">Payment Method</p>
            <p className="text-(--text-color)">Razorpay</p>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/owner/invoices")}
          className="flex items-center gap-2 rounded-lg border border-(--border-color) px-5 py-2 text-sm text-(--text-color) transition hover:bg-(--input-background)"
        >
          <FiArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}

export default InvoiceDetail;
