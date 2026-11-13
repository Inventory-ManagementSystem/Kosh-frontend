import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaChevronDown,
  FaFileAlt,
  FaPaperPlane,
  FaRegCalendarAlt,
} from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";
import { getReceivedStock } from "../api/receivedStockApi";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

const MOVEMENT_LABELS = {
  grn_received: "GRN Received",
  dispatch: "Dispatch",
};

const TABLE_HEADERS = [
  "PRODUCT",
  "Movement type",
  "Quantity change",
  "Balance after",
  "Recorded by",
  "Date & Time",
];

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

function formatPickerDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getChangeClass(change) {
  if (change > 0) return "text-(--success-color)";
  if (change < 0) return "text-red-400";
  return "text-(--text-color)";
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-(--border-color) bg-(--card-background) px-4 py-3">
      <p className="text-xs text-(--text-color)">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-bold text-(--text-color)">{value}</p>
        <Icon size={16} className="text-(--text-color)" />
      </div>
    </div>
  );
}

function DatePill({ id, label, value, min, max, onChange }) {
  const openPicker = (e) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      // showPicker can throw in restricted contexts; the native input still works
    }
  };

  return (
    <div className="relative flex h-8 w-36 items-center justify-between rounded-full border border-(--border-color) px-3 text-xs text-(--text-color)">
      <span>{value ? formatPickerDate(value) : label}</span>
      <FaRegCalendarAlt size={12} className="text-(--secondary-text-color)" />
      <input
        id={id}
        type="date"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
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
      <div className="mx-auto max-w-7xl space-y-5">
        <h1 className="text-3xl font-semibold text-(--accent-color)">
          Stock History
        </h1>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Movements"
            value={movements.length}
            icon={FaArchive}
          />
          <StatCard label="GRN Received" value={grnCount} icon={FaFileAlt} />
          <StatCard
            label="Dispatches"
            value={dispatchCount}
            icon={FaPaperPlane}
          />
        </div>

        <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
          <h2 className="text-base font-semibold text-(--text-color)">
            Inventory
          </h2>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <select
                id="movement-filter"
                aria-label="Movement type"
                value={selectedMovement}
                onChange={(e) => {
                  setSelectedMovement(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 w-40 cursor-pointer appearance-none rounded-full border border-(--border-color) bg-(--dropdown-background) pl-3 pr-8 text-xs text-(--text-color) outline-none"
              >
                <option value="all">Movement type</option>
                <option value="grn_received">GRN Received</option>
                <option value="dispatch">Dispatch</option>
              </select>
              <FaChevronDown
                size={10}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--secondary-text-color)"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DatePill
                id="from-date"
                label="From Date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(date) => {
                  setFromDate(date);
                  setCurrentPage(1);
                }}
              />
              <DatePill
                id="to-date"
                label="To Date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(date) => {
                  setToDate(date);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-center text-xs">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header}
                      className="bg-(--sidebar-active-background) px-4 py-3 text-[11px] font-normal text-(--secondary-text-color) first:rounded-l-lg last:rounded-r-lg"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {TABLE_HEADERS.map((header) => (
                        <td key={header} className="px-4 py-4">
                          <div className="mx-auto h-3 w-20 animate-pulse rounded bg-(--sidebar-active-background)" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : currentMovements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_HEADERS.length}
                      className="px-4 py-12 text-(--secondary-text-color)"
                    >
                      No stock movements found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  currentMovements.map((movement) => {
                    const change = Number(movement.quantity_change);

                    return (
                      <tr key={movement.id}>
                        <td className="px-4 py-4 font-medium text-(--accent-color)">
                          {movement.product_name || "—"}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {MOVEMENT_LABELS[movement.reason] ??
                            movement.reason ??
                            "—"}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-4 font-semibold ${getChangeClass(change)}`}
                        >
                          {change > 0 ? "+" : ""}
                          {movement.quantity_change ?? "—"}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {movement.balance_after ?? "—"}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {movement.created_by_email || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {formatDate(movement.created_at)}
                        </td>
                      </tr>
                    );
                  })
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
