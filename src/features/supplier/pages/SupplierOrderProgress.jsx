import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import {
  getSupplierInvoiceDetails,
  downloadSupplierInvoicePdf,
} from "../api/supplierOrderApi";
import logo from "../../../assets/auth/logo.svg";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const formatCurrency = (value) =>
  `\u20B9${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatStatus = (value) => (value ? value.replaceAll("_", " ") : "—");

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-(--secondary-text-color)">{label}</span>

      <span className="min-w-0 break-words text-right capitalize text-(--text-color)">
        {value ?? "—"}
      </span>
    </div>
  );
}

function SupplierOrderProgress() {
  const { orderId } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!accessToken || !orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}procurement/supplier/orders/${orderId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load order.");
      }

      const orderData = data.data ?? data;
      setOrder(orderData);

      const invoiceValue = orderData.invoice;
      const invoiceId =
        orderData.invoice_id ||
        (typeof invoiceValue === "object" ? invoiceValue?.id : invoiceValue);

      if (invoiceId) {
        const invoiceData = await getSupplierInvoiceDetails(
          accessToken,
          invoiceId,
        );

        setInvoice(invoiceData);
      } else if (invoiceValue && typeof invoiceValue === "object") {
        setInvoice(invoiceValue);
      } else {
        setInvoice(null);
      }
    } catch (error) {
      toast.error(error.message || "Unable to load order details.");
      setOrder(null);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleDownloadInvoice = async () => {
    if (!accessToken || downloading) return;

    const invoiceId =
      invoice?.id ||
      order?.invoice_id ||
      (typeof order?.invoice === "object" ? order.invoice?.id : order?.invoice);

    if (!invoiceId) {
      toast.error("Invoice is not available for this order yet.");
      return;
    }

    setDownloading(true);

    try {
      const blob = await downloadSupplierInvoicePdf(accessToken, invoiceId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const supplierName =
        invoice?.supplier?.company_name ||
        invoice?.company_name ||
        order?.supplier?.company_name ||
        "Supplier";

      const invoiceNumber =
        invoice?.number || order?.invoice?.number || "Invoice";

      const fileName = `${invoiceNumber}-${supplierName}`
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .trim();

      link.href = url;
      link.download = `${fileName}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      toast.success("Invoice downloaded successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to download invoice.");
    } finally {
      setDownloading(false);
    }
  };

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

  if (!order) {
    return (
      <div className="min-h-screen p-6 text-(--text-color)">
        <p>Unable to display this order.</p>

        <button
          type="button"
          onClick={() => navigate("/supplier/orders")}
          className="mt-4 rounded-lg border border-(--border-color) px-4 py-2"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const supplier = invoice?.supplier || order.supplier || {};
  const buyer = invoice?.buyer || order.buyer || {};
  const shipment = invoice?.shipment || order.shipment || {};

  const items = invoice?.items || order.items || [];

  const invoiceId =
    invoice?.id ||
    order.invoice_id ||
    (typeof order.invoice === "object" ? order.invoice?.id : order.invoice);

  return (
    <div className="min-h-screen space-y-5 p-4 text-(--text-color) sm:p-6">
      <h1 className="text-2xl font-semibold text-(--accent-color) sm:text-3xl">
        Order & Invoice
      </h1>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-lg bg-(--card-background) p-4">
          <h2 className="mb-5 text-base font-semibold text-(--accent-color)">
            Order Details
          </h2>

          <div className="space-y-4">
            <DetailRow label="Invoice No." value={invoice?.number} />

            <DetailRow
              label="Generated on"
              value={formatDate(invoice?.issue_date)}
            />

            <DetailRow label="Time" value={formatTime(invoice?.created_at)} />

            <DetailRow
              label="Sent to"
              value={buyer.business_name || order.business_name}
            />

            <DetailRow label="Status" value={order.status} />

            <DetailRow
              label="Dispatch Date"
              value={formatDate(shipment.dispatched_at || order.dispatch_date)}
            />

            <DetailRow
              label="Expected Delivery"
              value={formatDate(
                shipment.expected_delivery_date ||
                  order.expected_delivery_date ||
                  order.delivery_date,
              )}
            />

            {shipment.is_late && (
              <DetailRow
                label="Delivery Delay"
                value={`Late by ${shipment.late_by_days || order.late_by_days || 0} days`}
              />
            )}

            <DetailRow label="Tracking Note" value={shipment.tracking_note} />

            {invoice && (
              <>
                <div className="border-t border-(--border-color)" />

                <DetailRow
                  label="Invoice Total"
                  value={formatCurrency(invoice.grand_total)}
                />

                <DetailRow
                  label="Advance Applied"
                  value={formatCurrency(invoice.advance_applied)}
                />

                <DetailRow
                  label="Balance Payable"
                  value={formatCurrency(invoice.balance_due)}
                />

                {invoice.discrepancy_credit != null && (
                  <DetailRow
                    label="Goods Receipt Credit"
                    value={formatCurrency(invoice.discrepancy_credit)}
                  />
                )}

                {invoice.refund_due != null && (
                  <DetailRow
                    label="Advance Refund Due"
                    value={formatCurrency(invoice.refund_due)}
                  />
                )}

                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={downloading || !invoiceId}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-(--accent-color) px-4 py-3 text-sm font-semibold text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading ? "Downloading..." : "Download Invoice"}
                  <FiDownload size={16} />
                </button>
              </>
            )}

            {!invoice && (
              <p className="text-xs text-(--secondary-text-color)">
                Invoice details are not available yet.
              </p>
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-lg bg-(--card-background) p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-(--accent-color)">
                Order
              </h2>

              <p className="text-xs text-(--secondary-text-color)">
                #{invoice?.po_number}
              </p>
            </div>

            <img src={logo} alt="KOSH" className="h-6 w-auto" />
          </div>

          <div className="my-5 grid grid-cols-2 gap-5 text-xs">
            <div className="min-w-0 space-y-1">
              <p className="text-(--secondary-text-color)">From</p>

              <p className="font-medium">{supplier.company_name}</p>

              <p className="break-words text-(--secondary-text-color)">
                {supplier.address || "—"}
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
                {buyer.business_name || order.business_name || "—"}
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
                <tr className="bg-(--decoration-background) text-(--secondary-text-color)">
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
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-(--border-color)"
                  >
                    <td className="py-3 pr-3">
                      <p className="font-medium">{item.product_name || "—"}</p>

                      <p className="mt-1 text-(--secondary-text-color)">
                        {item.sku || "—"}
                      </p>
                    </td>

                    <td className="px-3 py-3">{item.quantity ?? "—"}</td>

                    <td className="px-3 py-3">
                      {formatCurrency(item.unit_price)}
                    </td>

                    <td className="px-3 py-3">{item.gst_rate ?? 0}%</td>

                    <td className="py-3 pl-3 text-right">
                      {formatCurrency(
                        item.line_total ??
                          Number(item.line_subtotal || 0) +
                            Number(item.line_tax || 0),
                      )}
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-(--secondary-text-color)"
                    >
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-(--secondary-text-color)">Subtotal</span>
              <span>{formatCurrency(invoice?.subtotal ?? order.subtotal)}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-(--secondary-text-color)">GST</span>
              <span>
                {formatCurrency(invoice?.tax_total ?? order.tax_total)}
              </span>
            </div>

            <div className="flex justify-between gap-3 border-t border-(--border-color) pt-3 text-sm font-semibold">
              <span>Invoice Total</span>
              <span className="text-(--accent-color)">
                {formatCurrency(invoice?.grand_total ?? order.grand_total)}
              </span>
            </div>

            {invoice && (
              <>
                <div className="flex justify-between gap-3">
                  <span className="text-(--secondary-text-color)">
                    Advance Applied
                  </span>
                  <span>{formatCurrency(invoice.advance_applied)}</span>
                </div>

                <div className="flex justify-between gap-3 font-semibold">
                  <span>Balance Payable</span>
                  <span>{formatCurrency(invoice.balance_due)}</span>
                </div>

                {Number(invoice.discrepancy_credit) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Goods Receipt Credit
                    </span>
                    <span>{formatCurrency(invoice.discrepancy_credit)}</span>
                  </div>
                )}

                {Number(invoice.refund_due) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Advance Refund Due
                    </span>
                    <span>{formatCurrency(invoice.refund_due)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-5 space-y-1 text-xs">
            <p className="text-(--secondary-text-color)">Tracking Note</p>
            <p>{shipment.tracking_note || "—"}</p>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/supplier/orders")}
          className="flex items-center gap-2 rounded-lg border border-(--border-color) px-5 py-2 text-sm text-(--text-color) transition hover:bg-(--input-background)"
        >
          <FiArrowLeft size={15} />
          Back to Orders
        </button>
      </div>
    </div>
  );
}

export default SupplierOrderProgress;
