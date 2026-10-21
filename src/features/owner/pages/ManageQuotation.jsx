import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import { getRFQDetails } from "../api/procurementApi";
import { getQuotations } from "../api/quotationApi";
import RfqCard from "../components/RfqCard";

const DEFAULT_WEIGHTS = {
  price: 59,
  delivery: 29,
  payment: 12,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return String(date);

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function ManageQuotation() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sort, setSort] = useState("rank");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [appliedWeights, setAppliedWeights] = useState(DEFAULT_WEIGHTS);

  const [showPriorities, setShowPriorities] = useState(true);
  const [rfqExpanded, setRfqExpanded] = useState(false);

  const loadData = useCallback(async () => {
    if (!accessToken || !rfqId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [rfqResponse, quotationResponse] = await Promise.all([
        getRFQDetails(accessToken, rfqId),
        getQuotations(accessToken, rfqId, {
          sort,
          weightPrice: appliedWeights.price,
          weightDelivery: appliedWeights.delivery,
          weightPayment: appliedWeights.payment,
        }),
      ]);

      setRfq(rfqResponse?.data ?? rfqResponse);

      const fetchedQuotations = Array.isArray(quotationResponse?.data)
        ? quotationResponse.data
        : [];
      setQuotations(fetchedQuotations);
      setSelectedQuotationId((currentId) =>
        currentId && fetchedQuotations.some((item) => item.id === currentId)
          ? currentId
          : null,
      );
    } catch (err) {
      setError(err.message || "Failed to load quotation details.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, rfqId, sort, appliedWeights]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateWeight = (key, value) => {
    setWeights((current) => ({
      ...current,
      [key]: Number(value),
    }));
  };

  const applyWeights = () => {
    const total = weights.price + weights.delivery + weights.payment;

    if (total === 0) {
      setError("At least one priority must be greater than zero.");
      return;
    }

    const price = Math.round((weights.price / total) * 100);
    const delivery = Math.round((weights.delivery / total) * 100);
    const payment = 100 - price - delivery;

    setError("");
    setAppliedWeights({ price, delivery, payment });
    setWeights({ price, delivery, payment });
  };

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
      quantity: item.quantity,
      sku: item.sku,
    })),
  };

  const rfqCardData = {
    ...rfqDetails,
    id: rfqDetails.id,
    status: rfqDetails.status,
  };

  const selectedQuotation = quotations.find(
    (quotation) => quotation.id === selectedQuotationId,
  );

  const selectedItems = selectedQuotation?.items ?? [];

  const selectedQuantity = selectedItems.reduce(
    (sum, item) => sum + Number(item.quantity ?? item.requested_quantity ?? 0),
    0,
  );

  const selectedAdvance = Number(selectedQuotation?.advance_amount) || 0;
  const selectedBalance = Number(selectedQuotation?.balance_amount) || 0;

  return (
    <main className="min-h-screen px-3 py-4 text-(--text-color) sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            {selectedQuotation && (
              <button
                type="button"
                onClick={() => setSelectedQuotationId(null)}
                className="mb-2 flex items-center gap-2 text-xs text-(--secondary-text-color) hover:text-(--text-color)"
              >
                <FiArrowLeft />
                All Quotations
              </button>
            )}

            <h1 className="font-['Google_Sans_Flex'] text-2xl font-semibold text-(--accent-color) sm:text-2xl">
              Manage Quotation
            </h1>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-(--border-color) px-3 py-2 text-xs hover:bg-(--sidebar-hover-background) disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="rounded-lg border border-(--error-color) bg-(--card-background) px-3 py-3 text-xs sm:text-sm">
            {error}
          </div>
        )}
        <section className="space-y-4 p-1 sm:p-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#56f4ed]" />
            <h2 className="text-base font-semibold sm:text-lg">
              Set Priorities
            </h2>
          </div>

          {showPriorities && (
            <div className="space-y-5 px-1 sm:px-3">
              {[
                { key: "price", label: "Price", color: "#39e9ef" },
                { key: "delivery", label: "Delivery", color: "#ff9800" },
                {
                  key: "payment",
                  label: "Advance Payment",
                  color: "#4bc783",
                },
              ].map((priority) => (
                <div
                  key={priority.key}
                  className="flex items-center gap-3 sm:gap-5"
                >
                  <span className="flex w-28 shrink-0 items-center gap-2 whitespace-nowrap text-xs sm:w-36 sm:text-sm">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    />
                    {priority.label}
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={weights[priority.key]}
                    onChange={(event) =>
                      updateWeight(priority.key, event.target.value)
                    }
                    aria-label={`${priority.label} weight`}
                    className="h-1.5 min-w-0 flex-1 cursor-pointer rounded-full"
                    style={{ accentColor: priority.color }}
                  />

                  <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums sm:text-sm">
                    {weights[priority.key]}%
                  </span>
                </div>
              ))}

              <div className="flex h-1 overflow-hidden rounded-full bg-[#202235]">
                <div
                  className="bg-[#456bff]"
                  style={{ width: `${weights.price}%` }}
                />
                <div
                  className="bg-[#ff9800]"
                  style={{ width: `${weights.delivery}%` }}
                />
                <div
                  className="bg-[#4bc783]"
                  style={{ width: `${weights.payment}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-(--secondary-text-color)">
                  Reliability excluded
                </p>

                <button
                  type="button"
                  onClick={applyWeights}
                  disabled={loading}
                  className="rounded-md border border-(--border-color) px-3 py-1.5 text-xs transition hover:bg-(--sidebar-hover-background) disabled:opacity-50"
                >
                  Apply Priorities
                </button>
              </div>
            </div>
          )}
        </section>
        <section>
          {loading && !rfq ? (
            <div className="rounded-lg border border-(--border-color) bg-(--card-background) p-4 text-xs text-(--secondary-text-color)">
              Loading RFQ...
            </div>
          ) : rfq ? (
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
          ) : null}
        </section>

        {selectedQuotation ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold sm:text-xl">
                {selectedQuotation.company_name || "Supplier"}
              </h2>

              <span className="rounded-md border border-(--border-color) px-2 py-1 text-xs text-(--secondary-text-color)">
                Quotation #{selectedQuotation.id}
              </span>
            </div>

            <div className="grid gap-3 rounded-xl border border-(--border-color) bg-(--card-background) p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(230px,0.48fr)]">
              <div className="min-w-0 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      Quotation No.
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      #{selectedQuotation.id}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      Created On
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(
                        selectedQuotation.submitted_at ??
                          selectedQuotation.updated_at,
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      From
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {selectedQuotation.company_name || "Supplier"}
                    </p>
                    {selectedQuotation.city && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-(--secondary-text-color)">
                        <FiMapPin />
                        {selectedQuotation.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      To
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {rfqDetails.company_name ??
                        rfqDetails.buyer_company_name ??
                        rfqDetails.owner_name ??
                        "All in One Enterprises"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 rounded-lg border border-(--border-color) p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      Quoted Price
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(selectedQuotation.grand_total)}
                    </p>

                    {selectedQuotation.score != null && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-[#63dc99]">
                        <FiCheckCircle />
                        Score {Number(selectedQuotation.score).toFixed(1)}/100
                      </p>
                    )}
                  </div>

                  <div className="border-t border-(--border-color) pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      Payment Terms
                    </p>

                    <div className="mt-2 flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(selectedAdvance)}
                        </p>
                        <p className="mt-1 text-[9px] text-(--secondary-text-color)">
                          Advance payment
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(selectedBalance)}
                        </p>
                        <p className="mt-1 text-[9px] text-(--secondary-text-color)">
                          Balance payment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Quoted Items</h3>
                    <span className="text-xs text-(--secondary-text-color)">
                      {selectedItems.length} items · {selectedQuantity} units
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-(--border-color)">
                    <table className="w-full min-w-[350px] text-left text-xs">
                      <thead className="bg-(--input-background) text-(--secondary-text-color)">
                        <tr>
                          <th className="px-3 py-2 font-medium">Product</th>
                          <th className="px-3 py-2 font-medium">Quantity</th>
                          <th className="px-3 py-2 font-medium">SKU</th>
                          <th className="px-3 py-2 text-right font-medium">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-(--border-color)"
                          >
                            <td className="px-3 py-2">
                              {item.product_name || "Product"}
                            </td>
                            <td className="px-3 py-2">
                              {item.quantity ?? item.requested_quantity ?? 0}
                            </td>
                            <td className="px-3 py-2">{item.sku || "—"}</td>
                            <td className="px-3 py-2 text-right">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ))}

                        {selectedItems.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-4 text-center text-(--secondary-text-color)"
                            >
                              No quotation items available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedQuotation.notes && (
                  <div>
                    <h3 className="text-xs font-semibold">Supplier Notes</h3>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-(--secondary-text-color)">
                      {selectedQuotation.notes}
                    </p>
                  </div>
                )}
              </div>

              <aside className="h-fit rounded-lg border border-(--border-color) bg-(--input-background) p-3">
                <h3 className="text-xs font-semibold">Quotation Breakdown</h3>

                <div className="mt-4 space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Order Number
                    </span>
                    <span className="break-all text-right font-medium">
                      #{rfqDetails.id ?? rfqId}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Quantity
                    </span>
                    <span className="text-right font-medium">
                      {selectedQuantity}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Delivery
                    </span>
                    <span className="text-right font-medium">
                      {formatDate(
                        selectedQuotation.delivery_date ??
                          selectedQuotation.expected_delivery,
                      )}
                    </span>
                  </div>

                  <div className="border-t border-(--border-color) pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-(--secondary-text-color)">
                        Total Price
                      </span>
                      <span className="text-right font-semibold">
                        {formatCurrency(selectedQuotation.grand_total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Pay Now
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(selectedAdvance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-(--secondary-text-color)">
                      Valid Until
                    </span>
                    <span className="text-right">
                      {formatDate(selectedQuotation.valid_until)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("Payment processing is not connected yet.")
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#b5c7e8] px-3 py-2 text-xs font-semibold text-[#101323] transition hover:bg-[#d0ddf5]"
                >
                  Pay
                  <FiArrowRight />
                </button>

                <p className="mt-2 text-center text-[10px] text-(--secondary-text-color)">
                  Payment is not enabled yet.
                </p>
              </aside>
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Supplier Quotations</h2>
                <p className="mt-1 text-xs text-(--secondary-text-color)">
                  {quotations.length} quotation
                  {quotations.length === 1 ? "" : "s"} received
                </p>
              </div>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort quotations"
                className="max-w-[130px] rounded-md border border-(--border-color) bg-(--dropdown-background) px-2 py-2 text-xs outline-none"
              >
                <option value="rank">Best ranked</option>
                <option value="price">Lowest price</option>
              </select>
            </div>

            {loading && (
              <p className="text-xs text-(--secondary-text-color)">
                Loading quotations...
              </p>
            )}

            {!loading && quotations.length === 0 && !error && (
              <div className="rounded-lg border border-(--border-color) bg-(--card-background) px-3 py-8 text-center">
                <FiPackage className="mx-auto mb-2 text-xl text-(--secondary-text-color)" />
                <p className="text-sm font-medium">No quotations received</p>
                <p className="mt-1 text-xs text-(--secondary-text-color)">
                  Supplier quotations will appear here.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quotations.map((quotation, index) => {
                const badges = Array.isArray(quotation.badges)
                  ? quotation.badges
                  : [];

                const isBest =
                  Number(quotation.rank) === 1 ||
                  badges.some((badge) =>
                    ["recommended", "best", "best_quotation"].includes(
                      String(badge).toLowerCase(),
                    ),
                  );

                return (
                  <article
                    key={quotation.id}
                    className={`relative min-w-0 rounded-xl border bg-(--card-background) p-4 ${
                      isBest ? "border-[#49665b]" : "border-(--border-color)"
                    }`}
                  >
                    {isBest && (
                      <span className="absolute -top-2 right-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#315746] bg-[#10251d] px-3 py-1 text-[9px] text-[#6ce6a1]">
                        Best Quotation
                      </span>
                    )}

                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#63e8a3]" />
                        <h3 className="break-words text-sm font-semibold">
                          {quotation.company_name || "Supplier"}
                        </h3>
                      </div>

                      <span className="shrink-0 text-xs text-(--secondary-text-color)">
                        #{quotation.rank ?? index + 1}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded border border-[#315746] px-2 py-1 text-[9px] text-[#6ce6a1]"
                        >
                          {String(badge).replaceAll("_", " ")}
                        </span>
                      ))}

                      {quotation.supplier_verified && (
                        <span className="flex items-center gap-1 rounded border border-[#315746] px-2 py-1 text-[9px] text-[#6ce6a1]">
                          <FiCheckCircle />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
                      Quoted Price
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(quotation.grand_total)}
                    </p>

                    {quotation.delivery_date &&
                      rfqDetails.expected_delivery && (
                        <p className="mt-1 text-[10px] text-[#63dc99]">
                          {(() => {
                            const deliveryDate = new Date(
                              quotation.delivery_date,
                            );
                            const expectedDate = new Date(
                              rfqDetails.expected_delivery,
                            );
                            const daysEarly = Math.round(
                              (expectedDate - deliveryDate) /
                                (1000 * 60 * 60 * 24),
                            );
                            return daysEarly > 0
                              ? `${daysEarly} days early`
                              : daysEarly === 0
                                ? "On expected date"
                                : `${Math.abs(daysEarly)} days late`;
                          })()}
                        </p>
                      )}

                    <div className="mt-4 space-y-3 border-t border-(--border-color) pt-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-(--secondary-text-color)">
                          <FiCalendar className="mr-1 inline" />
                          Delivery By
                        </span>
                        <span className="text-right">
                          {formatDate(
                            quotation.delivery_date ??
                              quotation.expected_delivery,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-(--secondary-text-color)">
                          Advance Payment
                        </span>
                        <span>{formatCurrency(quotation.advance_amount)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/manage-quotation/${rfqId}/quotation/${quotation.id}`,
                        )
                      }
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition ${
                        isBest
                          ? "border-[#b6c8e7] bg-[#b6c8e7] text-[#101323] hover:bg-[#d0dcf5]"
                          : "border-[#46536e] text-(--text-color) hover:bg-(--sidebar-hover-background)"
                      }`}
                    >
                      View Quotation
                      <FiArrowRight />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ManageQuotation;
