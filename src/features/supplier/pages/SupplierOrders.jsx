import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getSupplierOrders } from "../api/supplierOrderApi";

const PAGE_SIZE = 5;

const formatCurrency = (value) =>
  `\u20B9${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(
    value.length === 10 ? `${value}T00:00:00` : value,
  );

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatStatus = (status) =>
  status ? status.replaceAll("_", " ") : "—";

const getStatusClass = (status) => {
  if (status === "issued") return "text-(--accent-color)";
  if (status === "dispatched") return "text-blue-400";
  if (status === "partially_received") return "text-yellow-400";
  if (status === "received") return "text-green-400";

  return "text-(--secondary-text-color)";
};

function OrderCard({ order, onClick }) {
  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="w-full cursor-pointer rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-4 transition hover:border-(--accent-color) sm:px-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />

          <h2 className="truncate text-base font-semibold text-(--accent-color)">
            {order.business_name || order.company_name || "Order"}
          </h2>
        </div>

        <p className="shrink-0 text-right text-xs text-(--secondary-text-color)">
          ORDER NO.{" "}
          <span className="font-semibold text-(--text-color)">
            #{order.number || "—"}
          </span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs text-(--secondary-text-color)">
            Order Number
          </p>
          <p className="break-words text-sm font-semibold text-(--text-color)">
            {order.number || "—"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-1.5 text-xs text-(--secondary-text-color)">
            Delivery
          </p>
          <p className="break-words text-sm font-semibold text-(--text-color)">
            {formatDate(
              order.expected_delivery_date || order.delivery_date,
            )}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-1.5 text-xs text-(--secondary-text-color)">
            Stock
          </p>
          <p className="text-sm font-semibold text-(--text-color)">
            {order.total_quantity ?? 0}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-1.5 text-xs text-(--secondary-text-color)">
            Amount
          </p>
          <p className="break-words text-sm font-semibold text-(--text-color)">
            {formatCurrency(order.grand_total)}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-1.5 text-xs text-(--secondary-text-color)">
            Advance Amount
          </p>
          <p className="break-words text-sm font-semibold text-(--text-color)">
            {formatCurrency(order.advance_amount)}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-1.5 text-xs text-(--secondary-text-color)">
            Status
          </p>
          <p
            className={`text-sm font-semibold capitalize ${getStatusClass(order.status)}`}
          >
            {formatStatus(order.status)}
          </p>
        </div>
      </div>

      {order.is_late && (
        <p className="mt-4 text-xs text-(--error-color)">
          Late by {order.late_by_days || 0} days
        </p>
      )}
    </article>
  );
}

function AllOrders() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const fetchOrders = useCallback(async () => {
    if (!accessToken) {
      setOrders([]);
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getSupplierOrders(
        accessToken,
        page,
        PAGE_SIZE,
        status,
      );

      setOrders(data.results || []);
      setCount(data.count || 0);
    } catch (error) {
      toast.error(error.message || "Unable to load orders.");
      setOrders([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const openOrder = (order) => {
    if (!order?.id) {
      toast.error("Order ID is missing.");
      return;
    }

    if (order.status === "issued") {
      navigate(`/supplier/orders/${order.id}`);
      return;
    }

    if (
      ["dispatched", "partially_received", "received"].includes(
        order.status,
      )
    ) {
      navigate(`/supplier/orders/${order.id}/progress`);
      return;
    }

    toast.error("No detail page is available for this order status.");
  };

  const firstItem = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, count);

  return (
    <div className="min-h-screen space-y-5 p-4 text-(--text-color) sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-(--accent-color) sm:text-3xl">
          All Orders
        </h1>

        <select
          value={status}
          onChange={handleStatusChange}
          className="rounded-lg border border-(--border-color) bg-(--dropdown-background) px-3 py-2 text-sm text-(--text-color) outline-none"
        >
          <option value="">All Orders</option>
          <option value="issued">Issued</option>
          <option value="dispatched">Dispatched</option>
          <option value="partially_received">Partially Received</option>
          <option value="received">Received</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-(--border-color) bg-(--card-background)"
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => openOrder(order)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-12 text-center">
          <p className="text-sm text-(--secondary-text-color)">
            No orders found.
          </p>
        </div>
      )}

      {!loading && count > 0 && (
        <div className="flex items-center justify-center pt-2">

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(1)}
              title="First page"
              aria-label="First page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronsLeft size={16} />
            </button>

            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="flex h-9 items-center gap-1 rounded-lg border border-(--border-color) px-3 text-sm transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (pageNumber) =>
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - page) <= 1,
                )
                .reduce((result, pageNumber, index, pages) => {
                  if (index > 0 && pageNumber - pages[index - 1] > 1) {
                    result.push("ellipsis-" + pageNumber);
                  }

                  result.push(pageNumber);
                  return result;
                }, [])
                .map((item) =>
                  typeof item === "string" ? (
                    <span
                      key={item}
                      className="px-1 text-sm text-(--secondary-text-color)"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-label={`Page ${item}`}
                      aria-current={page === item ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-lg border px-3 text-sm transition ${
                        page === item
                          ? "border-(--accent-color) bg-(--accent-color) font-semibold text-(--page-background)"
                          : "border-(--border-color) hover:bg-(--input-background)"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="flex h-9 items-center gap-1 rounded-lg border border-(--border-color) px-3 text-sm transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight size={16} />
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              title="Last page"
              aria-label="Last page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border-color) transition hover:bg-(--input-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllOrders;