import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getActiveAlerts,
  getRFQs,
  getRFQSummary,
  getRFQDetails,
  cancelRFQ,
  refreshAlerts,
} from "../api/procurementApi";
import WarehouseTable from "../components/WarehouseTable";
import WarehouseTableSkeleton from "../components/WarehouseTableSkeleton";
import { BiSolidReport } from "react-icons/bi";
import { GoAlertFill } from "react-icons/go";
import { FiRefreshCw } from "react-icons/fi";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import RfqCard from "../components/RfqCard";
import ConfirmDelete from "../components/ConfirmDelete";

const PAGE_SIZE = 5;

function RFQAlerts() {
  const { accessToken, role } = useAuth();

  const isOwner = role === "owner" || role === "business_owner";

  const [summary, setSummary] = useState({});
  const [rfqs, setRfqs] = useState([]);
  const [rfqTotalPages, setRfqTotalPages] = useState(1);
  const [rfqPage, setRfqPage] = useState(1);
  const [alerts, setAlerts] = useState([]);
  const [alertTotalPages, setAlertTotalPages] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshingAlerts, setRefreshingAlerts] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [expandedRfqId, setExpandedRfqId] = useState(null);
  const [rfqDetails, setRfqDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [detailsError, setDetailsError] = useState({});
  const [confirmCancelRfq, setConfirmCancelRfq] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryData, rfqData, alertData] = await Promise.all([
        getRFQSummary(accessToken),
        getRFQs(accessToken, rfqPage, PAGE_SIZE),
        getActiveAlerts(accessToken, alertPage, PAGE_SIZE),
      ]);

      const rfqResponse = rfqData.data;
      const alertResponse = alertData.data;

      setSummary(summaryData.data);
      setRfqs(rfqResponse.results);
      setAlerts(alertResponse.results);

      setRfqTotalPages(
        Math.max(1, Math.ceil((rfqResponse.count || 0) / PAGE_SIZE)),
      );
      setAlertTotalPages(
        Math.max(1, Math.ceil((alertResponse.count || 0) / PAGE_SIZE)),
      );
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

  const handleRefreshAlerts = async () => {
    try {
      setRefreshingAlerts(true);
      setError("");

      const response = await refreshAlerts(accessToken);

      const created = response.data?.created;
      const activeAlerts = response.data?.active_alerts;

      if (created > 0) {
        toast.success(
          `${created} new alert${
            created === 1 ? "" : "s"
          } created. ${activeAlerts} active alerts in total.`,
        );
      } else {
        toast.success(`No new alerts. ${activeAlerts} active alerts in total.`);
      }
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to refresh alerts.");
    } finally {
      setRefreshingAlerts(false);
    }
  };

  const handleCancel = (rfq) => {
    setConfirmCancelRfq(rfq);
  };

  const handleConfirmCancel = async () => {
    if (!confirmCancelRfq) return;
    const rfqId = confirmCancelRfq.id;
    try {
      setCancellingId(rfqId);
      setError("");
      await cancelRFQ(accessToken, rfqId);
      toast.success("RFQ cancelled successfully.");
      setConfirmCancelRfq(null);

      if (rfqs.length === 1 && rfqPage > 1) {
        setRfqPage((prev) => prev - 1);
      } else {
        await loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel RFQ.");
    } finally {
      setCancellingId(null);
    }
  };

  const fetchRfqDetails = async (id) => {
    try {
      setDetailsLoading((prev) => ({
        ...prev,
        [id]: true,
      }));
      setDetailsError((prev) => ({
        ...prev,
        [id]: "",
      }));
      const response = await getRFQDetails(accessToken, id);
      setRfqDetails((prev) => ({
        ...prev,
        [id]: response.data || response,
      }));
    } catch (err) {
      setDetailsError((prev) => ({
        ...prev,
        [id]: err.message || "Failed to fetch RFQ details.",
      }));
    } finally {
      setDetailsLoading((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleToggleRfq = async (rfq) => {
    if (expandedRfqId === rfq.id) {
      setExpandedRfqId(null);
      return;
    }
    setExpandedRfqId(rfq.id);
    if (rfqDetails[rfq.id] || detailsLoading[rfq.id]) {
      return;
    }
    await fetchRfqDetails(rfq.id);
  };

  const handleRetryRfq = (id) => {
    setRfqDetails((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    fetchRfqDetails(id);
  };

  const formattedAlerts = alerts.map((alert) => ({
    id: alert.id,
    name: alert.product_name,
    sku: alert.sku,
    category_name: alert.category,
    quantity: alert.required_stock,
    price: alert.cost_price,
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
      <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
        RFQ & Alerts
      </h1>

      {error && (
        <div className="rounded-lg border border-(--border-color) p-3 text-sm text-(--error-color)">
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

      <section className="rounded-xl border border-(--border-color) bg-(--card-background) p-2 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
          <h2 className="text-base font-semibold">Active Alerts</h2>
          {isOwner && (
            <button
              type="button"
              onClick={handleRefreshAlerts}
              disabled={refreshingAlerts || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
            >
              <FiRefreshCw
                size={15}
                className={refreshingAlerts ? "animate-spin" : ""}
              />
            </button>
          )}
        </div>
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

      <section>
        <h2 className="mb-4 font-['Google_Sans_Flex'] text-xl font-semibold">
          All RFQ
        </h2>
        {rfqs.length === 0 ? (
          <p className="py-6 text-sm text-(--secondary-text-color)">
            No RFQs found.
          </p>
        ) : (
          <div className="space-y-3">
            {rfqs.map((rfq) => {
              const details = rfqDetails[rfq.id] || rfq;

              return (
                <RfqCard
                  key={rfq.id}
                  rfq={rfq}
                  details={{
                    ...details,
                    category:
                      details.supply_category || details.category || "—",
                    items: details.items || [],
                  }}
                  isExpand={expandedRfqId === rfq.id}
                  onToggle={() => handleToggleRfq(rfq)}
                  onCancel={() => handleCancel(rfq)}
                  cancelling={cancellingId === rfq.id}
                  detailsLoading={!!detailsLoading[rfq.id]}
                  detailsError={detailsError[rfq.id] || ""}
                  onRetry={() => handleRetryRfq(rfq.id)}
                />
              );
            })}
          </div>
        )}

        <Pagination
          page={rfqPage}
          totalPages={rfqTotalPages}
          onChange={setRfqPage}
        />
      </section>
      <ConfirmDelete
        isOpen={Boolean(confirmCancelRfq)}
        itemType="RFQ"
        description="Are you sure you want to cancel this RFQ?"
        onCancel={() => setConfirmCancelRfq(null)}
        onConfirm={handleConfirmCancel}
        loading={cancellingId !== null}
      />
    </div>
  );
}

function SummaryCard({ title, value }) {
  const isAlerts = title === "Active Alerts";

  return (
    <div className="flex items-center justify-between rounded-xl border border-(--border-color) bg-(--card-background) p-5">
      <div>
        <p className="text-xs text-(--secondary-text-color)">{title}</p>

        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </div>

      {isAlerts ? (
        <GoAlertFill size={24} className="ml-auto text-(--error-color)" />
      ) : (
        <BiSolidReport size={24} className="text-(--accent-color)" />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const buttonClass =
    "flex h-7 min-w-7 items-center justify-center rounded-md border border-(--border-color) px-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={page <= 1}
        aria-label="First page"
        className={buttonClass}
      >
        <FiChevronsLeft size={13} />
      </button>

      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={buttonClass}
      >
        <FiChevronLeft size={13} />
      </button>

      {getPages().map((item, index) =>
        item === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-7 min-w-5 items-center justify-center text-xs text-(--secondary-text-color)"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-label={`Page ${item}`}
            aria-current={page === item ? "page" : undefined}
            className={`${buttonClass} ${
              page === item
                ? "border-(--accent-color) bg-(--accent-color) font-semibold text-(--card-background)"
                : "text-(--secondary-text-color) hover:text-(--accent-color)"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={buttonClass}
      >
        <FiChevronRight size={13} />
      </button>

      <button
        type="button"
        onClick={() => onChange(totalPages)}
        disabled={page >= totalPages}
        aria-label="Last page"
        className={buttonClass}
      >
        <FiChevronsRight size={13} />
      </button>
    </div>
  );
}

export default RFQAlerts;
