import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsPeopleFill, BsPersonLinesFill } from "react-icons/bs";
import { GoAlertFill } from "react-icons/go";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getProfile } from "../../../api/getProfileApi";
import { getEmployees } from "../api/getEmployeeApi";
import { getSuppliers } from "../api/supplierApi";
import { getProducts } from "../api/warehouseApi";
import {
  getActiveAlerts,
  getRFQs,
  getRFQSummary,
  getOrders,
  cancelRFQ,
} from "../api/procurementApi";
import RfqCard from "../components/RfqCard";
import NewUserDashboard from "../components/NewUserDashboard";
import DashboardSkeleton from "../components/DashboardSkeleton";
import cuate from "../../../assets/auth/cuate.svg";

const LIST_SIZE = 5;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const orderProgress = {
  awaiting_advance: { label: "Pending", width: "2%" },
  issued: { label: "Pending", width: "20%" },
  dispatched: { label: "Dispatched", width: "50%" },
  partially_received: { label: "Partially Received", width: "75%" },
  received: { label: "Delivered", width: "100%" },
  cancelled: { label: "Cancelled", width: "0%" },
};

const getStatusClass = (status) => {
  if (["Delivered", "In Stock", "Approved", "Linked"].includes(status)) {
    return "bg-[#26af41]/20 text-[#5fba71]";
  }
  if (["Dispatched", "Partially Received", "Low Stock"].includes(status)) {
    return "bg-[#e5d283]/20 text-[#ffae00]";
  }
  if (["Out of Stock", "Cancelled"].includes(status)) {
    return "bg-[#e65757]/15 text-[#e65757]";
  }
  return "bg-[#454645]/37 text-(--text-color)";
};

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

function Dashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [stats, setStats] = useState({
    employees: 0,
    suppliers: 0,
    alerts: 0,
  });
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [expandedRfqId, setExpandedRfqId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

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

      const [
        employeeRes,
        supplierRes,
        productRes,
        alertRes,
        rfqRes,
        summaryRes,
        orderRes,
      ] = await Promise.all([
        getEmployees(accessToken),
        getSuppliers(accessToken),
        getProducts(accessToken, 1, LIST_SIZE),
        getActiveAlerts(accessToken, 1, LIST_SIZE),
        getRFQs(accessToken, 1, 3),
        getRFQSummary(accessToken),
        getOrders(accessToken, 1, 20),
      ]);

      const employeeData = employeeRes.data || {};
      const employeeList = (employeeData.employees ?? []).map((item) => ({
        id: `employee-${item.id}`,
        name: item.name || item.email,
        status: "Approved",
        date: item.joined_at,
      }));
      const inviteList = (employeeData.invites ?? []).map((item) => ({
        id: `invite-${item.id}`,
        name: item.email,
        status: "Pending",
        date: item.created_at,
      }));
      const allEmployees = [...employeeList, ...inviteList].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      const supplierList = (supplierRes.data ?? []).map((item) => ({
        id: item.id,
        name: item.display_name || item.company_name || item.email,
        status: capitalize(item.status),
      }));

      const productList = productRes.data?.results ?? [];
      const productCount = productRes.data?.count ?? 0;
      const rfqList = rfqRes.data?.results ?? [];

      const weekStart = Date.now() - WEEK_IN_MS;
      const orderList = (orderRes.results ?? [])
        .filter((order) => new Date(order.created_at).getTime() >= weekStart)
        .slice(0, LIST_SIZE);

      setStats({
        employees: employeeList.length,
        suppliers: supplierList.length,
        alerts: summaryRes.data?.active_alerts ?? alertRes.data?.count ?? 0,
      });
      setEmployees(allEmployees.slice(0, LIST_SIZE));
      setSuppliers(supplierList.slice(0, LIST_SIZE));
      setProducts(productList);
      setAlerts(alertRes.data?.results ?? []);
      setRfqs(rfqList);
      setWeeklyOrders(orderList);
      setIsNewUser(
        productCount === 0 &&
          allEmployees.length === 0 &&
          supplierList.length === 0 &&
          rfqList.length === 0,
      );
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

  const handleCancelRfq = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this RFQ?",
    );
    if (!confirmed) return;

    try {
      setCancellingId(id);
      await cancelRFQ(accessToken, id);
      toast.success("RFQ cancelled successfully.");
      await loadDashboard();
    } catch (error) {
      toast.error(error.message || "Failed to cancel RFQ.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isNewUser) {
    return <NewUserDashboard name={name} />;
  }

  return (
    <div className="space-y-6 text-(--text-color)">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="font-['Google_Sans_Flex'] text-2xl font-medium sm:text-3xl lg:text-4xl">
            From Inventory to Invoice,
          </h1>
          <p className="mt-1 font-['Google_Sans_Flex'] text-3xl font-semibold sm:text-4xl lg:text-5xl">
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
            title="Total Employees"
            value={stats.employees}
            icon={<BsPeopleFill size={18} className="text-(--accent-color)" />}
          />
          <StatCard
            title="Total Suppliers"
            value={stats.suppliers}
            icon={
              <BsPersonLinesFill size={18} className="text-(--accent-color)" />
            }
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
          <ViewAllButton onClick={() => navigate("/owner/orders")} />
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
                  onClick={() => navigate(`/owner/orders/${order.id}`)}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-['Google_Sans_Flex'] text-lg font-semibold">
              <GoAlertFill size={18} className="text-(--error-color)" />
              Alerts
            </h2>
            <ViewAllButton onClick={() => navigate("/rfq-alerts")} />
          </div>

          {alerts.length === 0 ? (
            <p className="py-4 text-sm text-(--secondary-text-color)">
              No active alerts.
            </p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <ProductRow
                  key={alert.id}
                  name={alert.product_name}
                  category={alert.category}
                  status={alert.stock_status}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
              Inventory Overview
            </h2>
            <ViewAllButton onClick={() => navigate("/warehouse")} />
          </div>

          {products.length === 0 ? (
            <p className="py-4 text-sm text-(--secondary-text-color)">
              No products added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  name={product.name}
                  category={product.category_name}
                  status={product.status}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
            Recent RFQ's
          </h2>
          <ViewAllButton onClick={() => navigate("/rfq-alerts")} />
        </div>

        {rfqs.length === 0 ? (
          <p className="py-4 text-sm text-(--secondary-text-color)">
            No RFQs found.
          </p>
        ) : (
          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <RfqCard
                key={rfq.id}
                rfq={rfq}
                details={{
                  ...rfq,
                  category: rfq.supply_category || rfq.category || "—",
                  items: rfq.items || [],
                }}
                isExpand={expandedRfqId === rfq.id}
                onToggle={() =>
                  setExpandedRfqId((prev) => (prev === rfq.id ? null : rfq.id))
                }
                onCancel={() => handleCancelRfq(rfq.id)}
                cancelling={cancellingId === rfq.id}
                detailsLoading={false}
                detailsError=""
                onRetry={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PeopleCard
          title="Recent Employees"
          items={employees}
          emptyMessage="No employees added yet."
          onViewAll={() => navigate("/employees")}
        />
        <PeopleCard
          title="Recent Suppliers"
          items={suppliers}
          emptyMessage="No suppliers added yet."
          onViewAll={() => navigate("/suppliers")}
        />
      </div>
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

function ProductRow({ name, category, status }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name || "—"}</p>
        <p className="truncate text-[11px] text-(--secondary-text-color)">
          {category || "—"}
        </p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function PeopleCard({ title, items, emptyMessage, onViewAll }) {
  return (
    <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
          {title}
        </h2>
        <ViewAllButton onClick={onViewAll} />
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-sm text-(--secondary-text-color)">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Dashboard;