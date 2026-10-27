import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsFileEarmarkTextFill, BsCartFill } from "react-icons/bs";
import { GoAlertFill } from "react-icons/go";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getProfile } from "../../../api/getProfileApi";
import { getSupplierRFQs, getSupplierRFQDetails } from "../api/supplierRfqApi";
import { getSupplierOrders } from "../api/supplierOrderApi";
import SupplierRfqCard from "../components/SupplierRfqCard";
import NewSupplierDashboard from "../components/NewSupplierDashboard";
import DashboardSkeleton from "../../owner/components/DashboardSkeleton";
import cuate from "../../../assets/auth/cuate.svg";

const LIST_SIZE = 5;
const RFQ_LIST_SIZE = 3;
const STATS_PAGE_SIZE = 100;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const ACTIVE_ORDER_STATUSES = [
  "awaiting_advance",
  "issued",
  "dispatched",
  "partially_received",
];

const orderProgress = {
  awaiting_advance: { label: "Pending", width: "2%" },
  issued: { label: "Pending", width: "20%" },
  dispatched: { label: "Dispatched", width: "50%" },
  partially_received: { label: "Partially Received", width: "75%" },
  received: { label: "Delivered", width: "100%" },
  cancelled: { label: "Cancelled", width: "0%" },
};

const getStatusClass = (status) => {
  if (["Delivered", "Paid", "Received"].includes(status)) {
    return "bg-[#26af41]/20 text-[#5fba71]";
  }
  if (["Dispatched", "Partially Received"].includes(status)) {
    return "bg-[#e5d283]/20 text-[#ffae00]";
  }
  if (["Cancelled", "Unpaid", "Failed"].includes(status)) {
    return "bg-[#e65757]/15 text-[#e65757]";
  }
  return "bg-[#454645]/37 text-(--text-color)";
};

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const formatStatus = (value) =>
  value
    ? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

const formatCurrency = (value) =>
  `\u20B9${(Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

  if (Number.isNaN(date.getTime())) return "—";

  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replaceAll("/", "-");
};

// Payment label shown on the Recent PO badge.
// Uses payment_status from the API if present, otherwise falls back to order status.
const getPaymentLabel = (order) => {
  if (order.payment_status) return formatStatus(order.payment_status);
  return (
    orderProgress[order.status]?.label || formatStatus(order.status) || "—"
  );
};

function SupplierDashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [stats, setStats] = useState({
    rfqs: 0,
    orders: 0,
    alerts: 0,
  });
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [expandedRfqId, setExpandedRfqId] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsErrors, setDetailsErrors] = useState({});

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      try {
        const response = await getProfile(accessToken);
        setName(response.data.name || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const loadDashboard = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const [rfqRes, orderRes] = await Promise.all([
        getSupplierRFQs(accessToken, 1, RFQ_LIST_SIZE),
        getSupplierOrders(accessToken, 1, STATS_PAGE_SIZE),
      ]);

      const rfqList = rfqRes?.results ?? [];
      const orderList = orderRes?.results ?? [];

      const activeOrders = orderList.filter((order) =>
        ACTIVE_ORDER_STATUSES.includes(order.status),
      );
      const lateOrders = orderList.filter(
        (order) => order.is_late && order.status !== "received",
      );

      const weekStart = Date.now() - WEEK_IN_MS;
      const thisWeek = orderList
        .filter((order) => {
          if (!order.created_at) return true;
          return new Date(order.created_at).getTime() >= weekStart;
        })
        .slice(0, LIST_SIZE);

      setStats({
        rfqs: rfqRes?.count ?? rfqList.length,
        orders: activeOrders.length,
        alerts: lateOrders.length,
      });
      setRfqs(rfqList);
      setWeeklyOrders(thisWeek);
      setRecentOrders(orderList.slice(0, RFQ_LIST_SIZE));
      setIsNewUser(rfqList.length === 0 && orderList.length === 0);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error(error.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadRfqDetails = async (invitationId, forceRefresh = false) => {
    if (!accessToken) return;
    if (detailsById[invitationId] && !forceRefresh) return;
    if (detailsLoadingId === invitationId) return;

    try {
      setDetailsLoadingId(invitationId);
      setDetailsErrors((previous) => ({ ...previous, [invitationId]: "" }));

      const details = await getSupplierRFQDetails(accessToken, invitationId);

      setDetailsById((previous) => ({ ...previous, [invitationId]: details }));
      setRfqs((previous) =>
        previous.map((rfq) =>
          rfq.id === invitationId
            ? { ...rfq, my_status: details.my_status }
            : rfq,
        ),
      );
    } catch (error) {
      setDetailsErrors((previous) => ({
        ...previous,
        [invitationId]: error.message || "Failed to load RFQ details.",
      }));
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const handleToggleRfq = async (rfq) => {
    if (expandedRfqId === rfq.id) {
      setExpandedRfqId(null);
      return;
    }

    setExpandedRfqId(rfq.id);

    if (!detailsById[rfq.id]) {
      await loadRfqDetails(rfq.id);
    }
  };

  const handleRfqClick = (rfq) => {
    const status = rfq.my_status?.toLowerCase();

    if (status === "sent" || status === "viewed") {
      navigate(`/supplier/create-quotation/${rfq.id}`);
    } else {
      handleToggleRfq(rfq);
    }
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
      ["dispatched", "partially_received", "received"].includes(order.status)
    ) {
      navigate(`/supplier/orders/${order.id}/progress`);
      return;
    }

    toast.error("No detail page is available for this order status.");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isNewUser) {
    return <NewSupplierDashboard name={name} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="font-['Google_Sans_Flex'] text-(--accent-color) text-2xl font-medium sm:text-3xl lg:text-4xl">
            From Inventory to Invoice,
          </h1>
          <p className="mt-1 font-['Google_Sans_Flex'] text-(--text-color) text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Simplified.
          </p>
        </div>

        <img
          src={cuate}
          alt="dashboard"
          className="hidden h-auto w-44 object-contain sm:block lg:w-56"
        />
      </div>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-4">
        <h2 className="mb-4 text-xs font-medium">Analytics</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            title="Active RFQ"
            value={stats.rfqs}
            icon={
              <BsFileEarmarkTextFill
                size={18}
                className="text-(--accent-color)"
              />
            }
          />
          <StatCard
            title="Active Orders"
            value={stats.orders}
            icon={<BsCartFill size={18} className="text-(--accent-color)" />}
          />
          <StatCard
            title="Active Alerts"
            value={stats.alerts}
            icon={<GoAlertFill size={18} className="text-(--error-color)" />}
          />
        </div>
      </section>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Weekly Orders</h2>
          <ViewAllButton onClick={() => navigate("/supplier/orders")} />
        </div>

        {weeklyOrders.length === 0 ? (
          <p className="py-4 text-sm text-(--secondary-text-color)">
            No orders placed this week.
          </p>
        ) : (
          <div className="space-y-5 sm:px-4">
            {weeklyOrders.map((order) => {
              const progress = orderProgress[order.status] || {
                label: capitalize(order.status),
                width: "0%",
              };

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => openOrder(order)}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <span className="w-24 shrink-0 text-xs font-medium sm:w-28">
                    Order #{order.number?.replace("PO-", "") || "—"}
                  </span>

                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-(--border-color)">
                    <span
                      className="block h-full rounded-full bg-(--dashboard-glow) transition-all"
                      style={{ width: progress.width }}
                    />
                  </span>

                  <span className="flex w-28 shrink-0 justify-end">
                    <StatusBadge status={progress.label} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
            Recent RFQ's
          </h2>
          <ViewAllButton onClick={() => navigate("/supplier-rfqs")} />
        </div>

        {rfqs.length === 0 ? (
          <p className="py-4 text-sm text-(--secondary-text-color)">
            No RFQs found.
          </p>
        ) : (
          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <SupplierRfqCard
                key={rfq.id}
                rfq={rfq}
                details={detailsById[rfq.id] || rfq}
                isExpand={expandedRfqId === rfq.id}
                onToggle={() => handleToggleRfq(rfq)}
                onCardClick={() => handleRfqClick(rfq)}
                canDecline={false}
                declining={false}
                detailsLoading={detailsLoadingId === rfq.id}
                detailsError={detailsErrors[rfq.id] || ""}
                onRetry={(id) => loadRfqDetails(id, true)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
            Recent PO
          </h2>
          <ViewAllButton onClick={() => navigate("/supplier/orders")} />
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-4 text-sm text-(--secondary-text-color)">
            No purchase orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <PurchaseOrderRow
                key={order.id}
                order={order}
                onClick={() => openOrder(order)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-(--input-background) px-4 py-4">
      <div>
        <p className="text-xs text-(--secondary-text-color)">{title}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </div>
      {icon}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(
        status,
      )}`}
    >
      {status || "—"}
    </span>
  );
}

function ViewAllButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-(--border-color) px-3 py-1 text-[10px] font-medium text-(--text-color) transition hover:border-(--accent-color) hover:text-(--accent-color)"
    >
      View All
    </button>
  );
}

function PurchaseOrderRow({ order, onClick }) {
  const fields = [
    {
      label: "Order Number",
      value: order.number || "—",
    },
    {
      label: "Delivery",
      value: formatDate(order.expected_delivery_date || order.delivery_date),
    },
    {
      label: "Stock",
      value: order.total_quantity ?? 0,
    },
    {
      label: "Amount",
      value: formatCurrency(order.grand_total),
    },
    {
      label: "Advance Amount",
      value: formatCurrency(order.advance_amount),
    },
  ];

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

          <h3 className="truncate text-sm font-semibold text-(--accent-color)">
            {order.business_name || order.company_name || "Order"}
          </h3>
        </div>

        <p className="shrink-0 text-right text-[10px] text-(--secondary-text-color)">
          ORDER NO.{" "}
          <span className="font-semibold text-(--text-color)">
            #{order.number || "—"}
          </span>
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <p className="mb-1.5 text-[11px] text-(--secondary-text-color)">
              {field.label}
            </p>
            <p className="break-words text-xs font-semibold text-(--text-color)">
              {field.value}
            </p>
          </div>
        ))}

        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] text-(--secondary-text-color)">
            Status
          </p>
          <StatusBadge status={getPaymentLabel(order)} />
        </div>
      </div>
    </article>
  );
}

export default SupplierDashboard;
