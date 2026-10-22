import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import { getRFQDetails } from "../api/procurementApi";
import { getQuotations } from "../api/quotationApi";
import RfqCard from "../components/RfqCard";
import AcceptAndPayButton from "../components/AcceptAndPayButton";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return String(date);

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function QuotationDetails() {
  const { rfqId, quotationId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rfqExpanded, setRfqExpanded] = useState(false);

  const loadData = useCallback(async () => {
    if (!accessToken || !rfqId || !quotationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [rfqResponse, quotationResponse] = await Promise.all([
        getRFQDetails(accessToken, rfqId),
        getQuotations(accessToken, rfqId, {
          sort: "rank",
          weightPrice: 59,
          weightDelivery: 29,
          weightPayment: 12,
        }),
      ]);

      const rfqData = rfqResponse?.data ?? rfqResponse;
      const quotationList = Array.isArray(quotationResponse?.data)
        ? quotationResponse.data
        : [];

      const selected = quotationList.find(
        (item) => String(item.id) === String(quotationId),
      );

      setRfq(rfqData);
      setQuotation(selected ?? null);

      if (!selected) {
        setError("This quotation could not be found for the selected RFQ.");
      }
    } catch (err) {
      setError(err.message || "Failed to load quotation details.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, rfqId, quotationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rfqDetails = rfq?.data ?? rfq ?? {};

  const rfqItems =
    rfqDetails.items ?? rfqDetails.rfq_items ?? rfqDetails.details?.items ?? [];

  const totalQuantity = rfqItems.reduce(
    (sum, item) => sum + Number(item.requested_quantity ?? item.quantity ?? 0),
    0,
  );

  const rfqCardDetails = {
    category: rfqDetails.supply_category,
    expected_delivery: rfqDetails.expected_delivery,
    item_count: rfqItems.length,
    total_quantity: totalQuantity,
    items: rfqItems.map((item) => ({
      ...item,
      id: item.id,
      product_name: item.product_name,
      quantity: item.requested_quantity,
      sku: item.sku,
    })),
  };

  const rfqCardData = {
    ...rfqDetails,
    id: rfqDetails.id ?? rfqId,
    status: rfqDetails.status ?? "submitted",
  };

  const items = quotation?.items ?? [];

  const totalQuotedQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity ?? item.requested_quantity ?? 0),
    0,
  );

  const advance = Number(quotation?.advance_amount) || 0;
  const balance = Number(quotation?.balance_amount) || 0;

  if (loading) {
    return (
      <main className="space-y-4 p-4 text-(--text-color) sm:p-6">
        <div className="rounded-xl border border-(--border-color) bg-(--card-background) p-5 text-sm text-(--secondary-text-color)">
          Loading quotation details...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-4 text-(--text-color) sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/manage-quotation/${rfqId}`)}
              className="mb-3 flex items-center gap-2 text-xs text-(--secondary-text-color) transition hover:text-(--text-color)"
            >
              <FiArrowLeft />
              Back to Quotations
            </button>
            <h1 className="font-['Google_Sans_Flex'] text-2xl font-semibold text-(--accent-color)">
              Quotation Details
            </h1>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-(--error-color) bg-(--card-background) p-4 text-sm">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-3 text-xs underline"
            >
              Try again
            </button>
          </div>
        )}

        {rfq && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">RFQ Details</h2>

            <RfqCard
              rfq={rfqCardData}
              details={rfqCardDetails}
              isExpand={rfqExpanded}
              onToggle={() => setRfqExpanded((current) => !current)}
              onCancel={() => {}}
              cancelling={false}
              detailsLoading={false}
              detailsError=""
              onRetry={loadData}
              onCardClick={() => setRfqExpanded((current) => !current)}
            />
          </section>
        )}

        {quotation && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {quotation.company_name || "Supplier"}
                </h2>

                {quotation.city && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-(--secondary-text-color)">
                    <FiMapPin />
                    {quotation.city}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {quotation.rank != null && (
                  <span className="rounded-md border border-(--border-color) px-2 py-1 text-xs">
                    Rank #{quotation.rank}
                  </span>
                )}

                {quotation.supplier_verified && (
                  <span className="flex items-center gap-1 rounded-md border border-(--border-color) px-2 py-1 text-xs text-[#63dc99]">
                    <FiCheckCircle />
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <section className="min-w-0 space-y-5 rounded-xl border border-(--border-color) bg-(--card-background) p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      Quotation Number
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      #{quotation.id}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      Submitted On
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(
                        quotation.submitted_at ?? quotation.updated_at,
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-(--border-color) pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      From
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {quotation.company_name || "Supplier"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      To
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {rfqDetails.buyer_company_name ??
                        rfqDetails.owner_company_name ??
                        rfqDetails.company_name ??
                        "Buyer"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 rounded-lg border border-(--border-color) p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      Quoted Price
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(quotation.grand_total)}
                    </p>

                    {quotation.score != null && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#63dc99]">
                        <FiCheckCircle />
                        Score {Number(quotation.score).toFixed(1)}/100
                      </p>
                    )}
                  </div>

                  <div className="border-t border-(--border-color) pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      Payment Terms
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(advance)}
                        </p>
                        <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                          Advance payment
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(balance)}
                        </p>
                        <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                          Balance payment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Quoted Items</h3>
                    <span className="text-xs text-(--secondary-text-color)">
                      {items.length} items · {totalQuotedQuantity} units
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-(--border-color)">
                    <table className="w-full min-w-[460px] text-left text-xs">
                      <thead className="bg-(--input-background) text-(--secondary-text-color)">
                        <tr>
                          <th className="px-3 py-3 font-medium">Product</th>
                          <th className="px-3 py-3 font-medium">Quantity</th>
                          <th className="px-3 py-3 font-medium">Unit Price</th>
                          <th className="px-3 py-3 font-medium">Tax</th>
                          <th className="px-3 py-3 text-right font-medium">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-(--border-color)"
                          >
                            <td className="px-3 py-3">
                              <p className="font-medium">
                                {item.product_name || "Product"}
                              </p>
                              <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                                SKU: {item.sku || "—"}
                              </p>
                            </td>

                            <td className="px-3 py-3">
                              {item.quantity ?? item.requested_quantity ?? 0}
                            </td>

                            <td className="px-3 py-3">
                              {formatCurrency(item.unit_price)}
                            </td>

                            <td className="px-3 py-3">{item.gst_rate ?? 0}%</td>

                            <td className="px-3 py-3 text-right font-medium">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ))}

                        {items.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-3 py-5 text-center text-(--secondary-text-color)"
                            >
                              No quotation items available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-(--border-color) pt-4">
                  <div>
                    <p className="text-[10px] text-(--secondary-text-color)">
                      Subtotal
                    </p>
                    <p className="mt-1 text-xs font-medium sm:text-sm">
                      {formatCurrency(quotation.subtotal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-(--secondary-text-color)">
                      Tax Total
                    </p>
                    <p className="mt-1 text-xs font-medium sm:text-sm">
                      {formatCurrency(quotation.tax_total)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-(--secondary-text-color)">
                      Grand Total
                    </p>
                    <p className="mt-1 text-xs font-semibold sm:text-sm">
                      {formatCurrency(quotation.grand_total)}
                    </p>
                  </div>
                </div>

                {quotation.notes && (
                  <div className="border-t border-(--border-color) pt-4">
                    <h3 className="text-sm font-semibold">Supplier Notes</h3>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-(--secondary-text-color)">
                      {quotation.notes}
                    </p>
                  </div>
                )}
              </section>
              <aside className="h-fit rounded-xl border border-(--border-color) bg-(--card-background) p-4">
                <h3 className="text-sm font-semibold">Quotation Breakdown</h3>

                <div className="mt-4 space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      RFQ Number
                    </span>
                    <span className="break-all text-right font-medium">
                      #{rfqDetails.id ?? rfqId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Quantity
                    </span>
                    <span className="font-medium">{totalQuotedQuantity}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      <FiCalendar className="mr-1 inline" />
                      Delivery
                    </span>
                    <span className="text-right font-medium">
                      {formatDate(
                        quotation.delivery_date ?? quotation.expected_delivery,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Valid Until
                    </span>
                    <span className="text-right">
                      {formatDate(quotation.valid_until)}
                    </span>
                  </div>

                  <div className="border-t border-(--border-color) pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-(--secondary-text-color)">
                        Total Price
                      </span>
                      <span className="text-right font-semibold">
                        {formatCurrency(quotation.grand_total)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-(--secondary-text-color)">
                        Pay Now
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(advance)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-(--secondary-text-color)">
                        Balance
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-(--border-color) p-3">
                  <p className="text-xs font-medium">Advance Payment</p>

                  <p className="mt-1 text-[11px] leading-5 text-(--secondary-text-color)">
                    Accept this quotation to create a purchase order. If an
                    advance is required, you can pay securely through Razorpay.
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-(--secondary-text-color)">
                      Advance Due
                    </span>

                    <span className="text-sm font-semibold">
                      {formatCurrency(advance)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <AcceptAndPayButton
                      quotationId={quotationId}
                      advanceAmount={advance}
                      onPaymentUpdate={() => {
                        loadData();
                      }}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default QuotationDetails;
