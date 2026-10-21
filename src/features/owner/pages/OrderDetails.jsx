import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getOrderDetails } from "../api/procurementApi";

const formatCurrency = (value) => {
  if (value == null || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `\u20B9${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusLabel = (status) => {
  const labels = {
    awaiting_advance: "Awaiting Advance",
    issued: "Order Issued",
    dispatched: "Dispatched",
    partially_received: "Partially Received",
    received: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status] || status || "Unknown";
};

const getStatusColor = (status) => {
  if (status === "received") {
    return "bg-green-500/15 text-green-400";
  }
  if (status === "dispatched" || status === "partially_received") {
    return "bg-amber-500/15 text-amber-400";
  }
  if (status === "cancelled") {
    return "bg-red-500/15 text-red-400";
  }
  return "bg-(--input-background) text-(--accent-color)";
};

function DetailItem({ value }) {
  return (
    <div className="min-w-0">
      <p className="wrap-break text-xs text-(--secondary-text-color)">
        {value || "—"}
      </p>
    </div>
  );
}

function ContactCard({ title, children, className = "" }) {
  return (
    <section className={`min-w-0 p-3 ${className}`}>
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!accessToken || !orderId) return;
      setLoading(true);
      try {
        const data = await getOrderDetails(accessToken, orderId);
        if (isMounted) {
          setOrder(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Unable to load order details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [accessToken, orderId]);
  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-7 w-40 rounded bg-(--border-color)" />
          <div className="h-4 w-56 rounded bg-(--border-color)" />
          <div className="h-72 rounded-lg bg-(--card-background)" />
          <div className="h-44 rounded-lg bg-(--card-background)" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <FiPackage size={32} className="text-(--secondary-text-color)" />
        <h2 className="text-lg font-semibold">Order not found</h2>
        <p className="text-sm text-(--secondary-text-color)">
          We couldn't load this purchase order.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border border-(--border-color) px-4 py-2 text-xs hover:bg-(--input-background)"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const isDispatched =
    Boolean(order.dispatch_date) ||
    ["dispatched", "partially_received", "received"].includes(order.status);
  const isReceived = order.status === "received";
  const expectedDate = order.expected_delivery_date || order.delivery_date;
  const today = new Date().getTime();
  const dispatchTime = order.dispatch_date
    ? new Date(order.dispatch_date).getTime()
    : null;
  const deliveryTime = expectedDate ? new Date(expectedDate).getTime() : null;
  let deliveryProgress = 0;
  if (isReceived) {
    deliveryProgress = 100;
  } else if (
    isDispatched &&
    dispatchTime &&
    deliveryTime &&
    deliveryTime > dispatchTime
  ) {
    deliveryProgress = Math.min(
      100,
      Math.max(
        0,
        ((today - dispatchTime) / (deliveryTime - dispatchTime)) * 100,
      ),
    );
  }

  const supplier = order.supplier || {};
  const buyer = order.buyer || {};
  const items = order.items || [];

  const progressSteps = [
    {
      label: "Order Placed",
      date: formatDate(order.created_at),
      completed: true,
    },
    {
      label: "Dispatched",
      date: isDispatched ? formatDate(order.dispatch_date) : "Pending",
      completed: isDispatched,
    },
    {
      label: "Delivery",
      date: formatDate(expectedDate),
      completed: isReceived,
    },
  ];

  return (
    <div className="min-h-screen p-4 text-(--text-color) sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Track Order</h1>
        <section className="rounded-lg bg-(--card-background) p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-(--secondary-text-color)">
                ORDER STATUS
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                  order.status,
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-(--secondary-text-color)">
                TOTAL ORDER VALUE
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(order.grand_total)}
              </p>
            </div>
          </div>

          {isCancelled ? (
            <div className="mt-5 flex items-start gap-3 rounded-md bg-red-500/10 p-3">
              <FiAlertCircle className="mt-0.5 shrink-0 text-red-400" />
              <div>
                <p className="text-xs font-medium text-red-400">
                  This order has been cancelled.
                </p>
                {order.cancelled_at && (
                  <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                    Cancelled on {formatDate(order.cancelled_at)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mt-7 grid grid-cols-3 gap-2">
                {progressSteps.map((step, index) => (
                  <div key={step.label} className="min-w-0">
                    <div className="flex items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          step.completed
                            ? "bg-green-500/15 text-green-400"
                            : "bg-(--input-background) text-(--secondary-text-color)"
                        }`}
                      >
                        {index === 0 ? (
                          <FiCheckCircle size={16} />
                        ) : index === 1 ? (
                          <FiTruck size={16} />
                        ) : (
                          <FiPackage size={16} />
                        )}
                      </div>

                      {index < progressSteps.length - 1 && (
                        <div className="relative ml-2 h-0.5 flex-1 overflow-hidden rounded-full bg-(--border-color)">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                            style={{
                              width:
                                index === 0
                                  ? isDispatched || isReceived
                                    ? "100%"
                                    : "0%"
                                  : `${deliveryProgress}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-[10px] font-medium sm:text-xs">
                      {step.label}
                    </p>
                    <p className="mt-1 text-[9px] text-(--secondary-text-color) sm:text-[10px]">
                      {step.date}
                    </p>
                  </div>
                ))}
              </div>

              {order.is_late && (
                <div className="mt-5 flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-amber-400">
                  <FiClock size={15} className="mt-0.5 shrink-0" />
                  <p className="text-xs">
                    This order is delayed by {order.late_by_days || 0}{" "}
                    {order.late_by_days === 1 ? "day" : "days"}.
                  </p>
                </div>
              )}

              {isDispatched && (
                <div className="mt-5 flex items-start gap-2 rounded-md bg-green-500/10 p-3 text-green-400">
                  <FiTruck size={15} className="mt-0.5 shrink-0" />
                  <p className="text-xs">
                    Your order was dispatched on{" "}
                    {formatDate(order.dispatch_date)}.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-(--border-color) pt-4 sm:grid-cols-3">
            <DetailItem
              label="ORDER DATE"
              value={formatDate(order.created_at)}
            />
            <DetailItem
              label="EXPECTED DELIVERY"
              value={formatDate(expectedDate)}
            />
            <DetailItem
              label="TOTAL QUANTITY"
              value={order.total_quantity ?? "—"}
            />
          </div>
        </section>

        <section className="rounded-lg bg-(--card-background) p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Order Items</h2>
            <span className="text-[10px] text-(--secondary-text-color)">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 items-center gap-3 rounded-lg bg-(--input-background) p-3"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.product_name || "Product"}
                    className="h-11 w-11 shrink-0 rounded-md border border-(--border-color) object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-(--border-color) text-(--secondary-text-color)">
                    <FiPackage size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                    {item.category || item.supply_category || "Uncategorized"}
                    {item.sku ? ` · ${item.sku}` : ""}
                  </p>
                  <p className=" text-xs font-medium">
                    {item.product_name || "Product"}
                  </p>
                  <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                    Quantity: {item.quantity ?? "—"}
                  </p>
                </div>

                <p className="shrink-0 text-xs font-semibold">
                  {formatCurrency(item.line_total)}
                </p>
              </div>
            ))}

            {items.length === 0 && (
              <p className="py-8 text-center text-xs text-(--secondary-text-color)">
                No order items available.
              </p>
            )}
          </div>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ContactCard title="Supplier Details">
              <DetailItem value={supplier.company_name} />
              <DetailItem
                value={[supplier.address, supplier.city]
                  .filter(Boolean)
                  .join(", ")}
              />
              <DetailItem value={supplier.phone} />
              <DetailItem value={supplier.email} />
              <DetailItem value={supplier.gstin} />
            </ContactCard>
            <div className="flex w-full justify-end">
              <div className="w-full lg:ml-auto lg:w-80">
                <ContactCard
                  title="Your Details"
                  className="text-left md:text-right"
                >
                  <DetailItem value={buyer.business_name} />
                  <DetailItem value={buyer.owner_name} />
                  <DetailItem value={buyer.business_type} />
                  <DetailItem value={buyer.city} />
                  <DetailItem value={buyer.email} />
                </ContactCard>
              </div>
            </div>
          </section>
        </section>
        <div className="pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-(--border-color) px-4 py-2 text-xs transition hover:bg-(--input-background)"
          >
            <FiArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
