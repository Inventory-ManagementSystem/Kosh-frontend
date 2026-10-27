import { useCallback, useEffect, useState } from "react";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import ConfirmDelete from "../../owner/components/ConfirmDelete";

import {
  getSupplierRFQs,
  getSupplierRFQDetails,
  declineSupplierRFQ,
} from "../api/supplierRfqApi";

import SupplierRfqCard from "../components/SupplierRfqCard";

const PAGE_SIZE = 5;

function SupplierRfq() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [rfqs, setRfqs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedRFQ, setExpandedRFQ] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsErrors, setDetailsErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [decliningId, setDecliningId] = useState(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadRFQs = useCallback(
    async (pageNumber = 1) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setPageError("");
        const response = await getSupplierRFQs(
          accessToken,
          pageNumber,
          PAGE_SIZE,
        );
        setRfqs(response.results || []);
        setTotalCount(response.count || 0);
      } catch (error) {
        setPageError(error.message || "Unable to load supplier RFQs.");
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    loadRFQs(page);
  }, [loadRFQs, page]);

  const loadDetails = async (invitationId, forceRefresh = false) => {
    if (!accessToken) return;
    if (detailsById[invitationId] && !forceRefresh) {
      return;
    }
    if (detailsLoadingId === invitationId) {
      return;
    }
    try {
      setDetailsLoadingId(invitationId);
      setDetailsErrors((previous) => ({
        ...previous,
        [invitationId]: "",
      }));

      const details = await getSupplierRFQDetails(accessToken, invitationId);
      setDetailsById((previous) => ({
        ...previous,
        [invitationId]: details,
      }));
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

  const handleToggle = async (rfq) => {
    if (expandedRFQ === rfq.id) {
      setExpandedRFQ(null);
      return;
    }
    setExpandedRFQ(rfq.id);
    if (!detailsById[rfq.id]) {
      await loadDetails(rfq.id);
    }
  };
  const canDecline = (rfq) => {
    if (rfq.rfq_status?.toLowerCase() !== "open") {
      return false;
    }
    const myStatus = rfq.my_status?.toLowerCase();
    if (myStatus === "quoted" || myStatus === "declined") {
      return false;
    }
    const details = detailsById[rfq.id];
    if (rfq.my_quotation || details?.my_quotation) {
      return false;
    }
    if (rfq.deadline) {
      const deadline = new Date(rfq.deadline).getTime();
      if (!Number.isNaN(deadline) && deadline < Date.now()) {
        return false;
      }
    }
    return true;
  };

  const handleDecline = (rfq) => {
    if (!canDecline(rfq)) {
      toast.error("This RFQ can no longer be declined.");
      return;
    }
    setSelectedRFQ(rfq);
  };
  const confirmDecline = async () => {
    if (!selectedRFQ) return;
    const rfq = selectedRFQ;
    try {
      setDecliningId(rfq.id);
      await declineSupplierRFQ(accessToken, rfq.id);
      setRfqs((previous) =>
        previous.map((item) =>
          item.id === rfq.id ? { ...item, my_status: "declined" } : item,
        ),
      );
      setDetailsById((previous) =>
        previous[rfq.id]
          ? {
              ...previous,
              [rfq.id]: {
                ...previous[rfq.id],
                my_status: "declined",
              },
            }
          : previous,
      );
      setSelectedRFQ(null);
      toast.success("RFQ declined successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to decline RFQ.");
    } finally {
      setDecliningId(null);
    }
  };

  if (loading && rfqs.length === 0) {
    return (
      <div className="space-y-5 p-4 text-(--accent-color) sm:p-6">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-(--border-color) bg-(--card-background) p-5"
          >
            <div className="h-4 w-36 rounded bg-(--input-background)" />
            <div className="mt-3 h-3 w-52 rounded bg-(--input-background)" />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, itemIndex) => (
                <div key={itemIndex}>
                  <div className="h-3 w-20 rounded bg-(--input-background)" />
                  <div className="mt-2 h-4 w-24 rounded bg-(--input-background)" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 text-(--accent-color) sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-['Google_Sans_Flex'] text-3xl font-semibold">
          All RFQs
        </h1>
      </div>

      {!pageError && rfqs.length === 0 ? (
        <div className="rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-10 text-center">
          <p className="font-medium text-(--text-color)">No RFQs found</p>

          <p className="mt-2 text-sm text-(--secondary-text-color)">
            New RFQ invitations will appear here.
          </p>
        </div>
      ) : (
        !pageError && (
          <section>
            <div className="space-y-3">
              {rfqs.map((rfq) => {
                const details = detailsById[rfq.id] || rfq;
                return (
                  <SupplierRfqCard
                    key={rfq.id}
                    rfq={rfq}
                    details={details}
                    isExpand={expandedRFQ === rfq.id}
                    onToggle={() => handleToggle(rfq)}
                    detailsLoading={detailsLoadingId === rfq.id}
                    detailsError={detailsErrors[rfq.id] || ""}
                    onDecline={() => handleDecline(rfq)}
                    canDecline={canDecline(rfq)}
                    declining={decliningId === rfq.id}
                    onCardClick={() => {
                      const status = rfq.my_status?.toLowerCase();
                      if (status === "sent" || status === "viewed") {
                        navigate(`/supplier/create-quotation/${rfq.id}`);
                      } else {
                        handleToggle(rfq);
                      }
                    }}
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(newPage) => {
                  setExpandedRFQ(null);
                  setPage(newPage);
                }}
              />
            )}
          </section>
        )
      )}
      <ConfirmDelete
        isOpen={Boolean(selectedRFQ)}
        itemType="RFQ"
        itemName={selectedRFQ?.title || selectedRFQ?.rfq_title || "RFQ"}
        onCancel={() => setSelectedRFQ(null)}
        onConfirm={confirmDecline}
        loading={decliningId === selectedRFQ?.id}
      />
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
            className="flex h-7 min-w-5 items-center justify-center text-xs text-(--page-background)"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`${buttonClass} ${
              page === item
                ? "border-(--accent-color) bg-(--accent-color) font-semibold text-(--page-background)"
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
        className={buttonClass}
      >
        <FiChevronsRight size={13} />
      </button>
    </div>
  );
}

export default SupplierRfq;
