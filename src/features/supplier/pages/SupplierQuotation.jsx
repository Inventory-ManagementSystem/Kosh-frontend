import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import {
  getSupplierRFQDetails,
  getSupplierQuotation,
  saveSupplierQuotation,
} from "../api/supplierRfqApi";

import SupplierRfqCard from "../components/SupplierRfqCard";

const getResponseData = (response) => response?.data ?? response;

const getProducts = (rfq) =>
  rfq?.items || rfq?.products || rfq?.rfq_items || rfq?.requested_items || [];

const getProductName = (item) =>
  item?.product_name ||
  item?.name ||
  item?.product?.name ||
  item?.product?.product_name ||
  "Product";

const getProductQuantity = (item) =>
  Number(item?.requested_quantity ?? item?.quantity ?? 0);

const getProductKey = (item, index) =>
  item?.id ?? item?.rfq_item_id ?? item?.product_id ?? index;

const getRFQItemId = (item) => item?.id ?? item?.rfq_item_id;

const formatCurrency = (amount) =>
  `\u20B9${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const inputClass =
  "h-10 w-full min-w-0 rounded border border-(--border-color) bg-(--input-background) px-3 text-xs text-(--text-color) outline-none placeholder:text-(--secondary-text-color) focus:border-(--accent-color)";

const labelClass =
  "mb-2 block text-[10px] font-medium uppercase text-(--text-color)";

function SupplierQuotation() {
  const { id: invitationId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prices, setPrices] = useState({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [notes, setNotes] = useState("");
  const [isRfqExpanded, setIsRfqExpanded] = useState(true);

  const products = useMemo(() => getProducts(rfq), [rfq]);
  const currentProduct = products[currentIndex];

  const currentKey = currentProduct
    ? getProductKey(currentProduct, currentIndex)
    : null;

  const currentPrice =
    currentKey !== null
      ? prices[currentKey] || { unitPrice: "", gst: "" }
      : { unitPrice: "", gst: "" };

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setLoading(true);

        const rfqResponse = await getSupplierRFQDetails(
          accessToken,
          invitationId,
        );

        const rfqData = getResponseData(rfqResponse);

        if (!active) return;

        setRfq(rfqData);

        const rfqProducts = getProducts(rfqData);
        const initialPrices = {};

        rfqProducts.forEach((item, index) => {
          const key = getProductKey(item, index);

          initialPrices[key] = {
            unitPrice: "",
            gst: "",
          };
        });

        const savedQuotationResponse = await getSupplierQuotation(
          accessToken,
          invitationId,
        );

        if (!active) return;

        const savedQuotation = getResponseData(savedQuotationResponse);

        if (savedQuotation && Array.isArray(savedQuotation.items)) {
          setQuotation(savedQuotation);
          setDeliveryDate(savedQuotation.delivery_date || "");
          setAdvancePayment(String(savedQuotation.advance_amount ?? ""));
          setNotes(savedQuotation.notes || "");

          savedQuotation.items.forEach((savedItem) => {
            const index = rfqProducts.findIndex(
              (product) =>
                String(getRFQItemId(product)) === String(savedItem.rfq_item_id),
            );

            if (index !== -1) {
              const key = getProductKey(rfqProducts[index], index);

              initialPrices[key] = {
                unitPrice: String(savedItem.unit_price ?? ""),
                gst: String(savedItem.gst_rate ?? ""),
              };
            }
          });
        }

        setPrices(initialPrices);
      } catch (error) {
        if (active) {
          toast.error(error?.message || "Unable to load quotation details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (accessToken && invitationId) {
      loadPage();
    }

    return () => {
      active = false;
    };
  }, [accessToken, invitationId]);

  const allProductsValid =
    products.length > 0 &&
    products.every((item, index) => {
      const price = prices[getProductKey(item, index)];

      if (!price) return false;

      const unitPrice = String(price.unitPrice ?? "").trim();
      const gst = String(price.gst ?? "").trim();

      if (!unitPrice || !gst) return false;

      const numericPrice = Number(unitPrice);
      const numericGst = Number(gst);

      return (
        Number.isFinite(numericPrice) &&
        numericPrice >= 0.01 &&
        Number.isFinite(numericGst) &&
        numericGst >= 0 &&
        numericGst <= 40
      );
    });

  const totalQuantities =
    quotation?.items?.reduce(
      (total, item) =>
        total + Number(item.quantity ?? item.requested_quantity ?? 0),
      0,
    ) ?? 0;

  const updatePrice = (key, field, value) => {
    setPrices((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        [field]: value,
      },
    }));
  };

  const validateCurrentProduct = () => {
    if (
      String(currentPrice.unitPrice).trim() === "" ||
      String(currentPrice.gst).trim() === ""
    ) {
      toast.error("Both unit price and GST are required.");
      return false;
    }

    const unitPrice = Number(currentPrice.unitPrice);
    const gst = Number(currentPrice.gst);

    if (!Number.isFinite(unitPrice) || unitPrice < 0.01) {
      toast.error("Unit price must be at least 0.01");
      return false;
    }

    if (!Number.isFinite(gst) || gst < 0 || gst > 40) {
      toast.error("GST must be between 0% and 40%.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentProduct()) return;

    if (currentIndex < products.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
    }
  };

  const validateQuotation = () => {
    if (!allProductsValid) {
      toast.error("Enter valid prices and GST for every product.");
      return false;
    }

    if (!deliveryDate) {
      toast.error("Delivery date is required.");
      return false;
    }

    if (deliveryDate < getToday()) {
      toast.error("Delivery date must be today or later.");
      return false;
    }

    if (String(advancePayment).trim() === "") {
      toast.error("Advance payment amount is required.");
      return false;
    }

    const advance = Number(advancePayment);

    if (!Number.isFinite(advance) || advance < 0) {
      toast.error("Advance payment cannot be negative.");
      return false;
    }

    return true;
  };

  const handleSendQuotation = async () => {
    if (!validateQuotation()) return;

    const items = products.map((item, index) => {
      const key = getProductKey(item, index);
      const price = prices[key];

      return {
        rfq_item: getRFQItemId(item),
        unit_price: String(price.unitPrice),
        gst_rate: String(price.gst),
      };
    });

    if (items.some((item) => !item.rfq_item)) {
      toast.error("An RFQ item ID is missing from the response.");
      return;
    }

    const payload = {
      items,
      advance_amount: String(advancePayment),
      delivery_date: deliveryDate,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      await saveSupplierQuotation(accessToken, invitationId, payload);

      const savedResponse = await getSupplierQuotation(
        accessToken,
        invitationId,
      );

      const savedQuotation = getResponseData(savedResponse);

      if (!savedQuotation || !Array.isArray(savedQuotation.items)) {
        throw new Error(
          "Quotation saved, but its summary could not be retrieved.",
        );
      }

      setQuotation(savedQuotation);
      setDeliveryDate(savedQuotation.delivery_date || "");
      setAdvancePayment(String(savedQuotation.advance_amount ?? ""));
      setNotes(savedQuotation.notes || "");

      const savedPrices = {};

      savedQuotation.items.forEach((savedItem) => {
        const index = products.findIndex(
          (product) =>
            String(getRFQItemId(product)) === String(savedItem.rfq_item_id),
        );

        if (index !== -1) {
          savedPrices[getProductKey(products[index], index)] = {
            unitPrice: String(savedItem.unit_price ?? ""),
            gst: String(savedItem.gst_rate ?? ""),
          };
        }
      });

      setPrices((previous) => ({
        ...previous,
        ...savedPrices,
      }));

      toast.success(
        Number(savedQuotation.revision) > 1
          ? "Quotation revised successfully."
          : "Quotation submitted successfully.",
      );
    } catch (error) {
      toast.error(error?.message || "Unable to submit quotation.");

      if (error?.details) {
        Object.values(error.details)
          .flat()
          .forEach((message) => {
            if (typeof message === "string") {
              toast.error(message);
            }
          });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 text-(--text-color) sm:p-6">
        <p className="animate-pulse text-sm text-(--secondary-text-color)">
          Loading quotation details...
        </p>
      </main>
    );
  }

  if (!rfq) {
    return (
      <main className="min-h-screen p-4 text-(--text-color) sm:p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-10 items-center gap-2 px-4 text-sm"
        >
          <FiArrowLeft />
          Back
        </button>

        <p className="mt-5 text-sm text-(--secondary-text-color)">
          Unable to load this RFQ.
        </p>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="min-h-screen p-4 text-(--text-color) sm:p-6">
        <p className="text-sm text-(--secondary-text-color)">
          No products were found in the RFQ response.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen min-w-0 w-full max-w-7xl space-y-5 p-3 text-(--text-color) sm:p-5 lg:p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="h-9 w-9 shrink-0"
      >
        <FiArrowLeft size={20} />
      </button>
      <header className="flex items-center gap-3">
        <h1 className="font-['Google_Sans_Flex'] text-(--accent-color) text-2xl font-bold sm:text-3xl">
          Post Quotation
        </h1>
      </header>

      <section className="min-w-0">
        <SupplierRfqCard
          rfq={rfq}
          details={rfq}
          isExpand={isRfqExpanded}
          onToggle={() => setIsRfqExpanded((previous) => !previous)}
          detailsLoading={false}
          detailsError=""
        />
      </section>

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <section className="flex min-w-0 flex-col rounded-xl border border-(--border-color) bg-(--card-background) p-4 sm:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Product Quotation</h2>

            <span className="rounded-md border border-(--border-color) px-2.5 py-1 text-[10px] text-(--secondary-text-color)">
              Product {currentIndex + 1} of {products.length}
            </span>
          </div>

          <div className="mb-5 flex gap-1">
            {products.map((item, index) => (
              <span
                key={getProductKey(item, index)}
                className={`h-1.5 flex-1 rounded-full ${
                  index <= currentIndex
                    ? "bg-(--accent-color)"
                    : "bg-(--border-color)"
                }`}
              />
            ))}
          </div>

          <div className="min-w-0">
            <label htmlFor="product-name" className={labelClass}>
              Product Name <span className="text-red-400">*</span>
            </label>

            <input
              id="product-name"
              value={getProductName(currentProduct)}
              readOnly
              className={inputClass}
            />

            <p className="mt-2 text-[11px] text-(--secondary-text-color)">
              Requested quantity: {getProductQuantity(currentProduct)}
            </p>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="unit-price" className={labelClass}>
                Amount per Unit <span className="text-red-400">*</span>
              </label>

              <input
                id="unit-price"
                type="number"
                min="0.01"
                step="0.01"
                onWheel={(event) => event.currentTarget.blur()}
                value={currentPrice.unitPrice}
                placeholder="Enter amount per unit"
                onChange={(event) =>
                  updatePrice(currentKey, "unitPrice", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="gst-rate" className={labelClass}>
                GST Rate (%) <span className="text-red-400">*</span>
              </label>

              <input
                id="gst-rate"
                type="number"
                min="0"
                max="40"
                step="0.01"
                value={currentPrice.gst}
                onWheel={(event) => event.currentTarget.blur()}
                placeholder="Enter GST rate"
                onChange={(event) =>
                  updatePrice(currentKey, "gst", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {currentIndex === products.length - 1 && (
            <div className="mt-5 space-y-4">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="delivery-date" className={labelClass}>
                    Delivery Date <span className="text-red-400">*</span>
                  </label>

                  <input
                    id="delivery-date"
                    type="date"
                    min={getToday()}
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="advance-payment" className={labelClass}>
                    Advance Payment <span className="text-red-400">*</span>
                  </label>

                  <input
                    id="advance-payment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePayment}
                    placeholder="Enter advance amount"
                    onWheel={(event) => event.currentTarget.blur()}
                    onChange={(event) => setAdvancePayment(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quotation-notes" className={labelClass}>
                  Notes
                </label>

                <textarea
                  id="quotation-notes"
                  rows={3}
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any additional details."
                  className="w-full resize-none rounded border border-(--border-color) bg-(--input-background) px-3 py-2 text-xs text-(--text-color) outline-none placeholder:text-(--secondary-text-color) focus:border-(--accent-color)"
                />
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-(--border-color) px-4 text-xs font-semibold hover:bg-(--decoration-background)"
              >
                <FiArrowLeft size={14} />
                Previous
              </button>
            )}

            {currentIndex < products.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-(--accent-color) px-4 text-xs font-semibold text-(--page-background) hover:opacity-85"
              >
                Next
                <FiArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendQuotation}
                disabled={saving}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-(--accent-color) px-4 text-xs font-semibold text-(--page-background) hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving quotation..."
                  : quotation
                    ? "Revise Quotation"
                    : "Send Quotation"}
              </button>
            )}
          </div>
        </section>

        <aside className="flex min-w-0 flex-col rounded-xl border border-(--border-color) bg-(--card-background) p-4 sm:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Quotation Summary</h2>

            {quotation && (
              <span className="rounded-md border border-(--border-color) px-2.5 py-1 text-[10px] text-(--secondary-text-color)">
                Revision {quotation.revision ?? 1}
              </span>
            )}
          </div>

          {!quotation ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-(--border-color) px-4 py-10 text-center text-xs text-(--secondary-text-color)">
              Your quotation summary will appear here after you submit the
              quotation.
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-(--border-color) p-3">
                  <p className="text-base text-(--secondary-text-color)">
                    Total Items
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {quotation.items?.length ?? 0}
                  </p>
                </div>

                <div className="rounded-lg border border-(--border-color) p-3">
                  <p className="text-base text-(--secondary-text-color)">
                    Total Quantity
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {totalQuantities}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-medium uppercase tracking-wide text-(--secondary-text-color)">
                  Item Breakdown
                </h3>

                {quotation.items?.map((item) => (
                  <div
                    key={item.id || item.rfq_item_id}
                    className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-(--border-color) p-3"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-xs font-medium">
                        {item.product_name || "Product"}
                      </p>

                      <p className="mt-1 break-words text-[10px] text-(--secondary-text-color)">
                        {item.quantity ?? item.requested_quantity ?? 0}{" "}
                        {formatCurrency(item.unit_price)}
                      </p>

                      <p className="mt-1 text-[10px] text-(--secondary-text-color)">
                        GST {item.gst_rate ?? 0}%
                      </p>
                    </div>

                    <strong className="shrink-0 text-right text-xs">
                      {formatCurrency(item.line_subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-(--border-color) pt-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-(--secondary-text-color)">
                    Subtotal
                  </span>
                  <strong>{formatCurrency(quotation.subtotal)}</strong>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-(--secondary-text-color)">
                    GST Total
                  </span>
                  <strong>{formatCurrency(quotation.tax_total)}</strong>
                </div>

                <div className="flex items-center justify-between gap-3 border-y border-(--border-color) py-4">
                  <span className="text-sm font-semibold">Total Price</span>
                  <strong className="break-words text-right text-lg">
                    {formatCurrency(quotation.grand_total)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-(--secondary-text-color)">
                    Delivery Date
                  </span>
                  <strong>{quotation.delivery_date || "—"}</strong>
                </div>

                {quotation.is_late && (
                  <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                    Delivery is {quotation.late_by_days} day(s) later than
                    expected.
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-(--secondary-text-color)">
                    Advance Payment
                  </span>
                  <strong>{formatCurrency(quotation.advance_amount)}</strong>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-(--secondary-text-color)">
                    Balance on Delivery
                  </span>
                  <strong>{formatCurrency(quotation.balance_amount)}</strong>
                </div>

                {quotation.notes && (
                  <div className="border-t border-(--border-color) pt-3">
                    <p className="text-[10px] uppercase text-(--secondary-text-color)">
                      Notes
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-xs">
                      {quotation.notes}
                    </p>
                  </div>
                )}

                <p className="border-t border-(--border-color) pt-3 text-[10px] capitalize text-(--secondary-text-color)">
                  Status: {quotation.status || "—"}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default SupplierQuotation;
