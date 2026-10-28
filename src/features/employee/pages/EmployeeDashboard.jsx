import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartShopping, FaWarehouse } from "react-icons/fa6";
import { IoMdListBox } from "react-icons/io";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getProfile } from "../../../api/getProfileApi";
import { getProducts } from "../../owner/api/warehouseApi";
import { getOrders, getOrdersSummary } from "../../owner/api/procurementApi";
import { getDispatchedOrders } from "../../owner/api/goodsReceiptApi";
import NewEmployeeDashboard from "../components/NewEmployeeDashboard";
import DashboardSkeleton from "../../owner/components/DashboardSkeleton";
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
    return "bg-green-100 text-green-400";
  }
  if (["Dispatched", "Partially Received", "Low Stock"].includes(status)) {
    return "bg-red-100 text-red-400";
  }
  if (["Out of Stock", "Cancelled"].includes(status)) {
    return "bg-blue-300 text-blue-600";
  }
  return "bg-stone-300 text-stone-600";
};

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

function EmployeeDashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    pendingGrn: 0,
  });
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [pendingGrns, setPendingGrns] = useState([]);

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

      const [productRes, lowStockRes, orderRes, summary, grnRes] =
        await Promise.all([
          getProducts(accessToken, 1, LIST_SIZE),
          getProducts(accessToken, 1, 50),
          getOrders(accessToken, 1, 20),
          getOrdersSummary(accessToken),
          getDispatchedOrders(accessToken, 1),
        ]);

      const productList = productRes.data?.results ?? [];
      const productCount = productRes.data?.count ?? 0;

      const lowStockList = (lowStockRes.data?.results ?? [])
        .filter((p) => ["Low Stock", "Out of Stock"].includes(p.status))
        .slice(0, LIST_SIZE);

      const weekStart = Date.now() - WEEK_IN_MS;
      const orderList = (orderRes.results ?? [])
        .filter((order) => new Date(order.created_at).getTime() >= weekStart)
        .slice(0, LIST_SIZE);

      const grnList = (grnRes.results ?? []).slice(0, LIST_SIZE);

      setProducts(productList);
      setLowStock(lowStockList);
      setWeeklyOrders(orderList);
      setPendingGrns(grnList);
      setStats({
        products: productCount,
        orders: summary.total,
        pendingGrn: grnRes.count ?? grnList.length,
      });
      setIsNewUser(productCount === 0 && summary.total === 0);
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isNewUser) {
    return <NewEmployeeDashboard name={name} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
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
            title="Total Products"
            value={stats.products}
            icon={<FaWarehouse size={18} className="text-(--accent-color)" />}
            onClick={() => navigate("/employee-warehouse")}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            icon={
              <FaCartShopping size={18} className="text-(--accent-color)" />
            }
            onClick={() => navigate("/employee/orders")}
          />
          <StatCard
            title="Awaiting GRN"
            value={stats.pendingGrn}
            icon={<IoMdListBox size={18} className="text-(--accent-color)" />}
            onClick={() => navigate("/employee/goods-receipts")}
          />
        </div>
      </section>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Weekly Orders</h2>
          <ViewAllButton onClick={() => navigate("/employee/orders")} />
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
                  onClick={() => navigate("/employee/orders")}
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
            <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
              Stock Alerts
            </h2>
          </div>

          {lowStock.length === 0 ? (
            <p className="py-4 text-sm text-(--secondary-text-color)">
              No low-stock products.
            </p>
          ) : (
            <div className="space-y-4">
              {lowStock.map((product) => (
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

        <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-['Google_Sans_Flex'] text-lg font-semibold">
              Inventory Overview
            </h2>
            <ViewAllButton onClick={() => navigate("/employee-warehouse")} />
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
            Pending Goods Receipts
          </h2>
          <ViewAllButton onClick={() => navigate("/employee/goods-receipts")} />
        </div>

        {pendingGrns.length === 0 ? (
          <p className="py-4 text-sm text-(--secondary-text-color)">
            No dispatched orders waiting for a GRN.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingGrns.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/employee/goods-receipts/${order.id}`)}
                className="flex w-full items-center justify-between gap-3 rounded-lg bg-(--input-background) px-4 py-3 text-left transition hover:bg-(--decoration-background)"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    Order #{order.number?.replace("PO-", "") || "—"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-(--border-color) px-3 py-1 text-[10px] font-medium text-(--accent-color)">
                  Create GRN
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-lg bg-(--input-background) px-4 py-4 text-left transition hover:bg-(--decoration-background)"
    >
      <div>
        <p className="text-xs text-(--secondary-text-color)">{title}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </div>
      {icon}
    </button>
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

export default EmployeeDashboard;
