import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getActiveAlerts,
  getRFQs,
  getRFQSummary,
  cancelRFQ,
} from "../api/procurementApi";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseTableSkeleton from "../components/WarehouseTableSkeleton";

function RFQAlerts() {
  const { accessToken } = useAuth();

  const [summary, setSummary] = useState({});
  const [rfqs, setRfqs] = useState([]);
  const [rfqTotalPages, setRfqTotalPages] = useState(1);
  const [rfqPage, setRfqPage] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const [alertTotalPages, setAlertTotalPages] = useState(1);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [summaryData, rfqData, alertData] = await Promise.all([
        getRFQSummary(accessToken),
        getRFQs(accessToken, rfqPage, 5),
        getActiveAlerts(accessToken, alertPage, 5),
      ]);
      setSummary(summaryData.data || summaryData);
      setRfqs(rfqData.data?.results || []);
      setAlerts(alertData.data?.results || []);
      setRfqTotalPages(rfqData.data?.total_pages || 1);
      setAlertTotalPages(alertData.data?.total_pages || 1);
    } catch (err) {
      setError(err.message || "Unable to load RFQ and alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken, rfqPage, alertPage]);

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this RFQ?",
    );
    if (!confirmed) return;
    try {
      setCancellingId(id);
      await cancelRFQ(accessToken, id);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to cancel RFQ.");
    } finally {
      setCancellingId(null);
    }
  };

  const formattedAlerts = alerts.map((alert) => ({
    id: alert.id,
    name: alert.product_name,
    sku: alert.sku,
    category_name: alert.category,
    quantity: alert.required_stock,
    price: null,
    status: alert.stock_status,
  }));

  if (loading && !rfqs.length && !alerts.length) {
    return (
      <div className="p-6 text-(--accent-color)">
        <h1 className="mb-5 text-3xl font-semibold">RFQ & Alerts</h1>
        <WarehouseTableSkeleton showDelete={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 text-(--accent-color) sm:p-6">
      <div>
        <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
          RFQ & Alerts
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bordertext-sm text-(--error-color)">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Monthly RFQ"
          value={summary.total_monthly_rfq ?? 0}
        />
        <SummaryCard
          title="Approved Quotations"
          value={summary.approved_quotations ?? 0}
        />
        <SummaryCard title="Active Alerts" value={summary.active_alerts ?? 0} />
      </div>

      <section className="rounded-xl border border-(--border-color) p-4">
        <h2 className="mb-4 text-base font-semibold">Requests for Quotation</h2>

        {rfqs.length === 0 ? (
          <p className="py-6 text-sm text-(--secondary-text-color)">
            No RFQs found.
          </p>
        ) : (
          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-(--border-color) p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">
                    {rfq.number || `RFQ #${rfq.id}`}
                  </p>
                  <p className="mt-1 text-sm text-(--secondary-text-color)">
                    {rfq.product_name || "Product"} · Quantity:{" "}
                    {rfq.quantity ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-(--secondary-text-color)">
                    Status: {rfq.status || "—"}
                  </p>
                </div>

                {rfq.status === "open" && (
                  <button
                    onClick={() => handleCancel(rfq.id)}
                    disabled={cancellingId === rfq.id}
                    className="rounded-lg px-3 py-2 text-sm text-red-400"
                  >
                    {cancellingId === rfq.id ? "Cancelling..." : "Cancel RFQ"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination
          page={rfqPage}
          totalPages={rfqTotalPages}
          onChange={setRfqPage}
        />
      </section>

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-2 sm:p-4">
        <h2 className="px-2 pt-2 text-base font-semibold">Active Alerts</h2>

        {alerts.length === 0 ? (
          <p className="p-4 text-sm text-(--secondary-text-color)">
            No active alerts found.
          </p>
        ) : (
          <WarehouseTable items={formattedAlerts} showDelete={false} />
        )}

        <Pagination
          page={alertPage}
          totalPages={alertTotalPages}
          onChange={setAlertPage}
        />
      </section>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5">
      <p className="text-xs text-(--secondary-text-color)">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-(--border-color) px-3 py-1.5 disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-(--secondary-text-color)">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-(--border-color) px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default RFQAlerts;
