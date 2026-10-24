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
  rfq?.items ||
  rfq?.products ||
  rfq?.rfq_items ||
  rfq?.requested_items ||
  [];

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
  `₹${Number(amount || 0).toLocaleString("en-IN", {
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
  const [isRfqExpanded, setIsRfqExpanded] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPage = async () => {
      try {
        setLoading(true);
        const rfqResponse = await getSupplierRFQDetails(
          accessToken,
          invitationId
        );
        const rfqData = getResponseData(rfqResponse);
        if (!active) return;
        setRfq(rfqData);
        const products = getProducts(rfqData);
        const initialPrices = {};
        products.forEach((item, index) => {
          const key = getProductKey(item, index);
          initialPrices[key] = {
            unitPrice: "",
            gst: "",
          };
        });

        const savedQuotation = await getSupplierQuotation(
          accessToken,
          invitationId
        );
        if (!active) return;
        if (savedQuotation) {
          setQuotation(savedQuotation);
          setDeliveryDate(savedQuotation.delivery_date || "");
          setAdvancePayment(
            String(savedQuotation.advance_amount ?? "")
          );
          savedQuotation.items?.forEach((savedItem) => {
            const index = products.findIndex(
              (product) =>
                String(getRFQItemId(product)) ===
                String(savedItem.rfq_item_id)
            );
            if (index !== -1) {
              const key = getProductKey(products[index], index);
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
          toast.error(
            error?.message || "Unable to load quotation details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (accessToken && invitationId) {
      loadPage();
    }

    return () => {
      active = false;
    };
  }, [accessToken, invitationId]);

  const products = useMemo(() => getProducts(rfq), [rfq]);
  const currentProduct = products[currentIndex];
  const currentKey = currentProduct
    ? getProductKey(currentProduct, currentIndex)
    : null;
  const currentPrice =
    currentKey !== null
      ? prices[currentKey] || { unitPrice: "", gst: "" }
      : { unitPrice: "", gst: "" };


const allProductsValid =
  products.length > 0 &&
  products.every((item, index) => {
    const key = getProductKey(item, index);
    const price = prices[key];
    if (!price) {
      return false;
    }
    const unitPrice = String(price.unitPrice ?? "").trim();
    const gst = String(price.gst ?? "").trim();
    if (unitPrice === "" || gst === "") {
      return false;
    }
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
        total +
        Number(item.quantity ?? item.requested_quantity ?? 0),
      0
    ) ?? 0;

  const updatePrice = (key, field, value) => {
    setPrices((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        [field]: value,
      },
    }));

    setShowPreview(false);
  };

  const validateCurrentProduct = () => {
    if (
      currentPrice.unitPrice.trim() === "" ||
      currentPrice.gst.trim() === ""
    ) {
      toast.error("Both unit price and GST are required.");
      return false;
    }

    const unitPrice = Number(currentPrice.unitPrice);
    const gst = Number(currentPrice.gst);

    if (!Number.isFinite(unitPrice) || unitPrice < 0.01) {
      toast.error("Unit price must be at least ₹0.01.");
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
    if (advancePayment.trim() === "") {
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
      valid_until: validUntil,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      await saveSupplierQuotation(accessToken, invitationId, payload);

      const savedQuotation = await getSupplierQuotation(
        accessToken,
        invitationId
      );

      if (!savedQuotation) {
        throw new Error("Quotation saved, but its summary could not be retrieved.");
      }

      setQuotation(savedQuotation);
      setDeliveryDate(savedQuotation.delivery_date || "");
      setAdvancePayment(String(savedQuotation.advance_amount ?? ""));
      setValidUntil(savedQuotation.valid_until || "");
      setNotes(savedQuotation.notes || "");
      setShowPreview(true);

      const savedPrices = {};

      savedQuotation.items?.forEach((savedItem) => {
        const index = products.findIndex(
          (product) =>
            String(getRFQItemId(product)) ===
            String(savedItem.rfq_item_id)
        );

        if (index !== -1) {
          savedPrices[getProductKey(products[index], index)] = {
            unitPrice: String(savedItem.unit_price ?? ""),
            gst: String(savedItem.gst_rate ?? ""),
          };
        }
      });

      setPrices((previous) => ({ ...previous, ...savedPrices }));

      toast.success(
        Number(savedQuotation.revision) > 1
          ? "Quotation revised successfully."
          : "Quotation submitted successfully."
      );
    } catch (error) {
      toast.error(error?.message || "Unable to submit quotation.");

      if (error?.details) {
        Object.values(error.details)
          .flat()
          .forEach((message) => {
            if (typeof message === "string") toast.error(message);
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
          className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-color) px-4 text-sm"
        >
          <FiArrowLeft />
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
    <main className="min-h-screen min-w-0 p-3 text-(--text-color) sm:p-5 lg:p-6">
      <h1 className="font-['Google_Sans_Flex'] mb-5 text-2xl font-bold sm:text-3xl">
        Post Quotation
      </h1>
      <section className="mb-5 min-w-0">
        <SupplierRfqCard
          rfq={rfq}
          details={rfq}
          isExpand={isRfqExpanded}
          onToggle={() => setIsRfqExpanded((previous) => !previous)}
          canDecline={false}
          declining={false}
          detailsLoading={false}
          detailsError=""
          onRetry={() => {}}
        />
      </section>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <section className="min-w-0 rounded-lg border border-(--border-color) bg-(--card-background) p-4 sm:p-5">
          <button
            type="button"
            onClick={() => {
              if (currentIndex === 0) {
                navigate(-1);
              } else {
                handlePrevious();
              }
            }}
            className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-(--decoration-background)"
            aria-label="Previous product or back to RFQs"
          >
            <FiArrowLeft size={15} />
          </button>

          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-wide text-(--secondary-text-color)">
              Product {currentIndex + 1} of {products.length}
            </span>

            <div className="flex gap-1">
              {products.map((item, index) => (
                <span
                  key={getProductKey(item, index)}
                  className={`h-1.5 w-5 rounded-full ${
                    index <= currentIndex
                      ? "bg-(--accent-color)"
                      : "bg-(--border-color)"
                  }`}
                />
              ))}
            </div>
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
            <p className="mt-2 text-[10px] text-(--secondary-text-color)">
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
                required
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
                required
                value={currentPrice.gst}
                placeholder="Enter GST rate"
                onChange={(event) =>
                  updatePrice(currentKey, "gst", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {currentIndex === products.length - 1 && (
            <>
              <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="delivery-date" className={labelClass}>
                    Delivery Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="delivery-date"
                    type="date"
                    min={getToday()}
                    required
                    value={deliveryDate}
                    onChange={(event) => {
                      setDeliveryDate(event.target.value);
                      setShowPreview(false);
                    }}
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
                    required
                    value={advancePayment}
                    placeholder="Enter advance amount"
                    onChange={(event) => {
                      setAdvancePayment(event.target.value);
                      setShowPreview(false);
                    }}
                    className={inputClass}
                  />
                </div>
              </div>

            </>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {currentIndex < products.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-(--accent-color) px-4 text-xs font-semibold text-(--page-background) hover:opacity-85"
              >
                Next
                <FiArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendQuotation}
                  disabled={saving}
                  className="h-10 flex-1 rounded bg-(--accent-color) px-3 text-xs font-semibold text-(--page-background) hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Send"
                    : quotation
                      ? "Revise Quotation"
                      : "Send Quotation"}
                </button>
              </>
            )}
          </div>
        </section>

        <aside className="min-w-0 rounded-lg border border-(--border-color) bg-(--card-background) p-4">
          <h2 className="mb-5 text-[10px] font-medium uppercase">
            Quotation Summary
          </h2>

          {!quotation || !showPreview ? (
            <div className="flex min-h-40 items-center justify-center px-3 text-center text-[11px] text-(--secondary-text-color)">
              {quotation
                ? "Click See Preview to display the saved quotation summary."
                : "Submit the quotation to retrieve the server-calculated summary."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-[var(--secondary-text-color)]">
                  Total Items
                </span>
                <strong>{quotation.items?.length ?? 0}</strong>
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-(--secondary-text-color)">
                  Total Quantities
                </span>
                <strong>{totalQuantities}</strong>
              </div>

              <div className="space-y-3 border-y border-(--border-color) py-3">
                {quotation.items?.map((item) => (
                  <div
                    key={item.id || item.rfq_item_id}
                    className="flex items-start justify-between gap-3 text-[10px]"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-(--secondary-text-color)">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                      <p className="mt-1 break-words text-[9px] text-(--secondary-text-color)">
                        {item.product_name} · GST {item.gst_rate}%
                      </p>
                    </div>
                    <strong className="shrink-0 text-right">
                      {formatCurrency(item.line_subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-(--secondary-text-color)">
                  Subtotal
                </span>
                <strong>{formatCurrency(quotation.subtotal)}</strong>
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-(--secondary-text-color)">
                  GST Total
                </span>
                <strong>{formatCurrency(quotation.tax_total)}</strong>
              </div>

              <div className="flex items-center justify-between gap-3 border-y border-(--border-color) py-3">
                <span className="text-[11px] font-semibold">Total Price</span>
                <strong className="break-words text-right text-sm font-bold">
                  {formatCurrency(quotation.grand_total)}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-(--secondary-text-color)">
                  Delivery Date
                </span>
                <strong>{quotation.delivery_date || "—"}</strong>
              </div>

              {quotation.is_late && (
                <p className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-400">
                  Delivery is {quotation.late_by_days} day(s) later than expected.
                </p>
              )}

              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-(--secondary-text-color)">
                  Advance Payment
                </span>
                <strong>{formatCurrency(quotation.advance_amount)}</strong>
              </div>

              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-(--secondary-text-color)">
                  Balance on Delivery
                </span>
                <strong>{formatCurrency(quotation.balance_amount)}</strong>
              </div>

              <p className="border-t border-(--border-color) pt-3 text-[10px] text-(--secondary-text-color)">
                Revision {quotation.revision} · {quotation.status}
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default SupplierQuotation;
