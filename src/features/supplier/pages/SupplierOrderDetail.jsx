import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import {
  getSupplierOrderDetails,
  dispatchSupplierOrder,
} from "../api/supplierOrderApi";

const formatCurrency = (value) =>
  `\u20B9${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

function SupplierOrderDetail() {
  const { orderId } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [dispatching, setDispatching] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!accessToken || !orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getSupplierOrderDetails(accessToken, orderId);
      setOrder(data);
    } catch (error) {
      toast.error(error.message || "Unable to load order.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-(--card-background)" />
        <div className="h-24 animate-pulse rounded-lg bg-(--card-background)" />
        <div className="h-80 animate-pulse rounded-lg bg-(--card-background)" />
      </div>
    );
  }

  const handleDispatch = async () => {
    if (dispatching) return;
    try {
      setDispatching(true);
      const result = await dispatchSupplierOrder(accessToken, orderId);
      toast.success(
        result?.shipment && result?.invoice
          ? "Order dispatched and invoice generated successfully."
          : "Order dispatched successfully.",
      );
      await fetchOrder();
    } catch (error) {
      toast.error(error.message || "Failed to dispatch order.");
    } finally {
      setDispatching(false);
    }
  };

  if (!order) {
    return (
      <div className="p-6 text-(--text-color)">
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

  const supplier = order.supplier || {};
  const buyer = order.buyer || {};
  const items = order.items || [];

  const advance = Number(order.advance_amount) || 0;
  const total = Number(order.grand_total) || 0;
  const balance = Number(order.balance_amount ?? total - advance);

  return (
    <div className="min-h-screen space-y-5 p-4 text-(--text-color) sm:p-6">
      <h1 className="text-2xl font-semibold text-(--accent-color) sm:text-3xl">
        PO &amp; Invoice
      </h1>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-sm font-medium">
              {buyer.business_name || order.business_name || "Buyer"}
            </span>
          </div>

          <p className="text-xs text-(--secondary-text-color)">
            ORDER NO.{" "}
            <span className="font-semibold text-(--text-color)">
              #{order.number}
            </span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Order Number", value: order.number || "—" },
            {
              label: "Delivery",
              value: formatDate(
                order.expected_delivery_date || order.delivery_date,
              ),
            },
            { label: "Stock", value: order.total_quantity ?? 0 },
            { label: "Amount", value: formatCurrency(order.grand_total) },
            {
              label: "Advance Amount",
              value: formatCurrency(order.advance_amount),
            },
            {
              label: "Status",
              value: order.advance_paid ? "Paid" : "Pending",
            },
          ].map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="mb-1 text-[10px] uppercase text-(--secondary-text-color)">
                {item.label}
              </p>
              <p className="break-words text-xs font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-semibold">
        {buyer.business_name || order.business_name || "Purchase Order"}
      </h2>

      {/* Main order information */}
      <section className="rounded-xl bg-(--card-background) p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase text-(--secondary-text-color)">
              ORDER NO.
            </p>
            <p className="mt-1 font-semibold">{order.number || "—"}</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase text-(--secondary-text-color)">
              CREATED ON
            </p>
            <p className="mt-1 font-semibold">
              {formatDate(order.created_at || order.issued_at)}
            </p>
          </div>
        </div>

        <div className="my-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] uppercase text-(--secondary-text-color)">
              From
            </p>
            <p className="font-semibold">
              {supplier.company_name || order.company_name || "—"}
            </p>
            <p className="text-xs text-(--secondary-text-color)">
              {supplier.address || "—"}
            </p>
            <p className="text-xs text-(--secondary-text-color)">
              {supplier.city || "—"}
            </p>
            <p className="break-all text-xs text-(--secondary-text-color)">
              {supplier.phone || "—"}
            </p>
            <p className="break-all text-xs text-(--secondary-text-color)">
              {supplier.email || "—"}
            </p>
            <p className="text-xs text-(--secondary-text-color)">
              GSTIN: {supplier.gstin || "—"}
            </p>
          </div>

          <div className="min-w-0 space-y-1 sm:text-right">
            <p className="text-[10px] uppercase text-(--secondary-text-color)">
              To
            </p>
            <p className="font-semibold">
              {buyer.business_name || order.business_name || "—"}
            </p>
            <p className="text-xs text-(--secondary-text-color)">
              {buyer.owner_name || "—"}
            </p>
            <p className="text-xs text-(--secondary-text-color)">
              {buyer.city || order.business_city || "—"}
            </p>
            <p className="break-all text-xs text-(--secondary-text-color)">
              {buyer.email || "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
          <div className="rounded-xl border border-(--border-color) p-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase text-(--secondary-text-color)">
                  Quoted Price
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatCurrency(order.grand_total)}
                </p>
                <p className="mt-1 text-[10px] text-green-400">
                  Order total including GST
                </p>
              </div>

              <div className="border-t border-(--border-color) pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <p className="text-[10px] uppercase text-(--secondary-text-color)">
                  Advance Payment
                </p>
                <p className="mt-2 font-semibold">{formatCurrency(advance)}</p>
              </div>

              <div className="border-t border-(--border-color) pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <p className="text-[10px] uppercase text-(--secondary-text-color)">
                  After Delivery
                </p>
                <p className="mt-2 font-semibold">{formatCurrency(balance)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-(--border-color) p-3">
            <p className="mb-4 text-[10px] font-semibold uppercase text-(--secondary-text-color)">
              Order Breakdown
            </p>

            <div className="space-y-3">
              <DetailRow label="Order Number" value={order.number} />
              <DetailRow label="Quantity" value={order.total_quantity ?? 0} />
              <DetailRow
                label="Delivery"
                value={formatDate(
                  order.expected_delivery_date || order.delivery_date,
                )}
              />
              <DetailRow
                label="Total Price"
                value={formatCurrency(order.grand_total)}
              />
              <DetailRow label="Balance Due" value={formatCurrency(balance)} />
            </div>

            {order.advance_paid && advance > 0 && (
              <div className="mt-4 rounded-lg border border-green-400/40 p-2 text-center text-xs font-semibold uppercase text-green-400">
                Advance Paid
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-(--card-background) p-4 sm:p-5">
        <h2 className="mb-4 text-base font-semibold">Order Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="bg-(--input-background) text-(--secondary-text-color)">
                <th className="rounded-l-lg px-3 py-3">Product</th>
                <th className="px-3 py-3">Quantity</th>
                <th className="px-3 py-3">Unit Price</th>
                <th className="px-3 py-3">GST</th>
                <th className="rounded-r-lg px-3 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-(--border-color)"
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="mt-1 text-(--secondary-text-color)">
                        {item.sku || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">{item.quantity ?? 0}</td>
                    <td className="px-3 py-3">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-3 py-3">{Number(item.gst_rate) || 0}%</td>
                    <td className="px-3 py-3 text-right">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-(--secondary-text-color)"
                  >
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {order.is_late && (
        <p className="text-sm text-(--error-color)">
          This order is late by {order.late_by_days || 0} days.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/supplier/orders")}
          className="flex items-center gap-2 rounded-lg border border-(--border-color) px-5 py-2 text-sm transition hover:bg-(--input-background)"
        >
          <FiArrowLeft size={15} />
          Back
        </button>

        <button
          type="button"
          onClick={handleDispatch}
          className="rounded-lg bg-(--accent-color) px-5 py-2.5 text-sm font-semibold text-[#00010f] transition hover:opacity-90"
        >
          Dispatch Order
        </button>
      </div>
    </div>
  );
}

export default SupplierOrderDetail;
