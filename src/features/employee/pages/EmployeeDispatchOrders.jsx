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
import {
  getDispatchedOrders,
  getOrderDetails,
} from "../../owner/api/goodsReceiptApi";

const PAGE_SIZE = 8;

function EmployeeDispatchOrders() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const loadOrders = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);

    try {
      const data = await getDispatchedOrders(accessToken, page);
      const results = data.results || [];

      const ordersWithCategories = [];

      for (const order of results) {
        let category = "—";

        try {
          const details = await getOrderDetails(accessToken, order.id);
          const categories = [
            ...new Set(
              (details.items || [])
                .map(
                  (item) =>
                    item.category || item.supply_category
                )
                .filter(Boolean)
            ),
          ];

          category = categories.length
            ? categories.join(", ")
            : "—";
        } catch {
          // Keep the order visible if category lookup fails.
        }

        ordersWithCategories.push({
          ...order,
          category,
        });
      }

      setOrders(ordersWithCategories);
      setCount(data.count || 0);
    } catch (error) {
      toast.error(error.message || "Unable to load dispatched orders.");
      setOrders([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let number = start; number <= end; number++) {
      pages.push(number);
    }

    return pages;
  };

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const buttonClass =
    "flex h-7 min-w-7 items-center justify-center rounded border border-[var(--border-color)] px-2 text-[10px] text-[var(--text-color)] transition hover:bg-[var(--input-background)] disabled:cursor-not-allowed disabled:opacity-35";

  const pageNumbers = getPageNumbers();

  return (
    <div className="min-h-full px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-5 text-2xl font-semibold text-[var(--accent-color)] sm:text-3xl">
          Delivered Orders
        </h1>

        <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-background)] px-4 py-4 sm:px-7">
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_0.8fr] items-center rounded-md bg-[var(--input-background)] px-3 py-3 text-[12px] font-medium uppercase tracking-wide text-[var(--secondary-text-color)] sm:px-5">
                <span className="text-center">Order ID</span>
                <span className="text-center">Supplying Agency</span>
                <span className="text-center">Category</span>
                <span className="text-center">Price</span>
              </div>

              <div className="mt-2">
                {loading ? (
                  <div className="space-y-1">
                    {Array.from({ length: PAGE_SIZE }, (_, index) => (
                      <div
                        key={index}
                        className="h-9 animate-pulse rounded bg-[var(--input-background)]"
                      />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-sm text-[var(--secondary-text-color)]">
                      No dispatched orders found.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() =>
                        navigate(`/employee/goods-receipts/${order.id}`)
                      }
                      className="grid min-h-10 w-full grid-cols-[1fr_1.5fr_1fr_0.8fr] items-center rounded-md px-3 py-2 text-[14px] text-[var(--text-color)] transition hover:bg-[var(--input-background)] sm:px-5"
                    >
                      <span className="text-center">
                        {order.number}
                      </span>

                      <span className="truncate px-1 text-center">
                        {order.company_name || "—"}
                      </span>

                      <span className="truncate px-1 text-center">
                        {order.category}
                      </span>

                      <span className="text-center">
                        {formatPrice(order.grand_total)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {!loading && count > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(1)}
                className={buttonClass}
                aria-label="First page"
              >
                <FiChevronsLeft size={12} />
              </button>

              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                className={buttonClass}
              >
                <FiChevronLeft size={12} />
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <PageButton
                    number={1}
                    active={page === 1}
                    onClick={changePage}
                  />
                  {pageNumbers[0] > 2 && (
                    <span className="px-1 text-[10px] text-[var(--secondary-text-color)]">
                      ...
                    </span>
                  )}
                </>
              )}

              {pageNumbers.map((number) => (
                <PageButton
                  key={number}
                  number={number}
                  active={page === number}
                  onClick={changePage}
                />
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-[10px] text-[var(--secondary-text-color)]">
                      ...
                    </span>
                  )}
                  <PageButton
                    number={totalPages}
                    active={page === totalPages}
                    onClick={changePage}
                  />
                </>
              )}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => changePage(page + 1)}
                className={buttonClass}
              >
                <FiChevronRight size={12} />
              </button>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => changePage(totalPages)}
                className={buttonClass}
                aria-label="Last page"
              >
                <FiChevronsRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageButton({ number, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(number)}
      className={`h-7 min-w-7 rounded px-2 text-[10px] transition ${
        active
          ? "bg-[var(--input-background)] font-semibold text-[var(--accent-color)]"
          : "text-[var(--text-color)] hover:bg-[var(--input-background)]"
      }`}
    >
      {number}
    </button>
  );
}

export default EmployeeDispatchOrders;
