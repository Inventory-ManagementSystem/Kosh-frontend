import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiDotsThreeCircleFill } from "react-icons/pi";
import { FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseTableSkeleton from "../components/WarehouseTableSkeleton";
import Pagination from "../components/Pagination";

import {
  getOrders,
  getOrdersSummary,
  getOrderDetails,
} from "../api/procurementApi";

function AllOrders() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const PAGE_SIZE = 8;
  const fetchOrders = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await getOrders(accessToken, page, PAGE_SIZE);
      const orderList = data.results || [];
      const ordersWithCategories = [];
      for (const order of orderList) {
        try {
          const details = await getOrderDetails(accessToken, order.id);
          const categories = [
            ...new Set(
              (details.items || [])
                .map((item) => [item.category || item.supply_category])
                .filter(Boolean),
            ),
          ];
          ordersWithCategories.push({
            ...order,
            category_name: categories.length ? categories.join(", ") : "—",
          });
        } catch {
          ordersWithCategories.push({
            ...order,
            category_name: "—",
          });
        }
      }

      setOrders(ordersWithCategories);
      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / PAGE_SIZE)));
    } catch (error) {
      toast.error(error.message || "Unable to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page]);

  const fetchSummary = useCallback(async () => {
    if (!accessToken) return;
    setSummaryLoading(true);
    try {
      const data = await getOrdersSummary(accessToken);
      setSummary(data);
    } catch (error) {
      toast.error(error.message || "Unable to load order summary.");
    } finally {
      setSummaryLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleOrderClick = (order) => {
    navigate(`/owner/orders/${order.id}`);
  };

  const summaryCards = [
    {
      title: "Total Orders",
      value: summary.total,
      icon: <FaShoppingCart size={20} />,
      iconClass: "text-(--accent-color)",
    },
    {
      title: "Completed Orders",
      value: summary.completed,
      icon: <FaCheckCircle size={20} />,
      iconClass: "text-[#5fba71]",
    },
    {
      title: "Pending Orders",
      value: summary.pending,
      icon: <PiDotsThreeCircleFill size={20} />,
      iconClass: "text-[#ff985c]",
    },
  ];

  return (
    <div className="min-h-screen space-y-3 p-4 text-(--accent-color) sm:p-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">All Orders</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="flex min-w-0 items-center justify-between rounded-lg bg-(--card-background) px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-xs text-(--secondary-text-color)">
                {card.title}
              </p>

              <p className="mt-0.5 text-sm font-semibold">
                {summaryLoading ? "—" : card.value}
              </p>
            </div>
            <span className={card.iconClass}>{card.icon}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg bg-(--card-background)">
        {loading ? (
          <WarehouseTableSkeleton variant="orders" />
        ) : orders.length > 0 ? (
          <WarehouseTable
            items={orders}
            variant="orders"
            showDelete={false}
            onOrderClick={handleOrderClick}
          />
        ) : (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-medium">No orders found</p>
            <p className="mt-1 text-xs text-(--secondary-text-color)">
              Your purchase orders will appear here.
            </p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}

export default AllOrders;
