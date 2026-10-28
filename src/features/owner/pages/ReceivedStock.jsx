import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getReceivedStock } from "../api/receivedStockApi";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReceivedStock() {
  const { accessToken } = useAuth();

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovement, setSelectedMovement] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!accessToken) return;
    const loadStockHistory = async () => {
      try {
        setLoading(true);
        const response = await getReceivedStock(accessToken, {
          from: fromDate,
          to: toDate,
        });
        setMovements(response.results || []);
      } catch (error) {
        toast.error(error.message || "Failed to load stock history.");
        setMovements([]);
      } finally {
        setLoading(false);
      }
    };

    loadStockHistory();
  }, [accessToken, fromDate, toDate]);

  const filteredMovements = movements.filter((movement) => {
    if (selectedMovement === "all") return true;
    return movement.reason === selectedMovement;
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovements.length / PAGE_SIZE),
  );
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentMovements = filteredMovements.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const grnCount = movements.filter(
    (movement) => movement.reason === "grn_received",
  ).length;

  const dispatchCount = movements.filter(
    (movement) => movement.reason === "dispatch",
  ).length;

  return (
    <div className="min-h-screen p-4 text-(--text-color) sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-(--accent-color) sm:text-3xl">
            Stock History
          </h1>
          <p className="mt-2 text-sm text-(--text-color)">
            Track incoming and outgoing stock movements in your inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
            <p className="text-sm text-(--secondary-text-color)">
              Total Movements
            </p>
            <p className="mt-2 text-2xl text-(--text-color) font-semibold">
              {movements.length}
            </p>
          </div>
          <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
            <p className="text-sm text-(--secondary-text-color)">
              GRN Received
            </p>
            <p className="mt-2 text-2xl font-semibold text-(--text-color)">
              {grnCount}
            </p>
          </div>
          <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
            <p className="text-sm text-(--secondary-text-color)">Dispatches</p>
            <p className="mt-2 text-2xl text-(--text-color) font-semibold">
              {dispatchCount}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full xl:max-w-xs">
              <label
                htmlFor="movement-filter"
                className="mb-2 block text-sm text-(--secondary-text-color)"
              >
                Movement Type
              </label>
              <select
                id="movement-filter"
                value={selectedMovement}
                onChange={(e) => {
                  setSelectedMovement(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-xl border border-(--border-color) bg-(--dropdown-background) px-3 text-sm text-(--text-color) outline-none sm:max-w-52"
              >
                <option value="all">All Movements</option>
                <option value="grn_received">GRN Received</option>
                <option value="dispatch">Dispatch</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-1 xl:justify-end">
              <div>
                <label htmlFor="from-date" className="mb-2 block text-sm">
                  From Date
                </label>

                <div className="relative">
                  <input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => {
                      const date = e.target.value;
                      setFromDate(date);
                      setAppliedFrom(date);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-(--border-color) bg-(--input-background) px-3 py-2.5 pr-9 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="to-date" className="mb-2 block text-sm">
                  To Date
                </label>
                <div className="relative">
                  <input
                    id="to-date"
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => {
                      const date = e.target.value;
                      setToDate(date);
                      setAppliedTo(date);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-(--border-color) bg-(--input-background) px-3 py-2.5 pr-9 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-(--border-color) text-(--secondary-text-color)">
                  <th className="px-4 py-4 font-medium">Product</th>
                  <th className="px-4 py-4 font-medium">Movement Type</th>
                  <th className="px-4 py-4 font-medium">Quantity Change</th>
                  <th className="px-4 py-4 font-medium">Balance After</th>
                  <th className="px-4 py-4 font-medium">Recorded By</th>
                  <th className="px-4 py-4 font-medium">Date & Time</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-(--secondary-text-color)"
                    >
                      Loading stock history
                    </td>
                  </tr>
                ) : currentMovements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-(--secondary-text-color)"
                    >
                      No stock movements found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  currentMovements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-(--border-color)"
                    >
                      <td className="px-4 py-4">
                        <p>{movement.product_name || "—"}</p>
                        {movement.product_sku && (
                          <p className="mt-1 text-xs">{movement.product_sku}</p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {movement.reason === "grn_received" ? (
                          <span className="inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium">
                            GRN Received
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium">
                            Dispatch
                          </span>
                        )}
                      </td>

                      <td
                        className={`whitespace-nowrap px-4 py-4 font-medium ${
                          Number(movement.quantity_change) > 0
                            ? "text-emerald-400"
                            : Number(movement.quantity_change) < 0
                              ? "text-red-400"
                              : "text-(--text-color)"
                        }`}
                      >
                        {Number(movement.quantity_change) > 0 ? "+" : ""}
                        {movement.quantity_change ?? "—"}
                      </td>

                      <td className="px-4 py-4">
                        {movement.balance_after ?? "—"}
                      </td>

                      <td className="px-4 py-4">
                        {movement.created_by_email || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {formatDate(movement.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredMovements.length > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceivedStock;
