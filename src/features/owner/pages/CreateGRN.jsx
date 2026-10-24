import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";
import logo from "../../../assets/auth/logo.svg";

import { useAuth } from "../../../context/AuthContext";
import { getOrderDetails, createGRN } from "../api/goodsReceiptApi";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date)
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
}

function getDispatchedQuantity(item, shipment) {
  const shipmentItems = shipment?.items || [];

  const shipmentItem = shipmentItems.find(
    (entry) =>
      entry.purchase_order_item === item.id ||
      entry.order_item === item.id ||
      entry.purchase_order_item_id === item.id
  );

  return Number(
    shipmentItem?.dispatched_quantity ??
      shipmentItem?.shipped_quantity ??
      shipmentItem?.quantity ??
      item.quantity ??
      0
  );
}

function getInitialItems(order) {
  return (order.items || []).map((item) => ({
    purchase_order_item: item.id,
    product_name: item.product_name || "",
    sku: item.sku || "",
    category: item.category || item.supply_category || "—",
    ordered_quantity: Number(item.quantity || 0),
    dispatched_quantity: getDispatchedQuantity(item, order.shipment),
    received_quantity: "",
    rejected_quantity: "",
  }));
}

function Label({ children, required }) {
  return (
    <span className="mb-2 block text-[14px] font-semibold text-[var(--text-color)]">
      {children}
      {required && <span className="text-[var(--error-color)]">*</span>}
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  readOnly = false,
  min,
  max,
  maxLength,
}) {
  return (
    <label className="block min-w-0">
      <Label required={required}>{label}</Label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        onWheel={(event) => event.currentTarget.blur()}
        onKeyDown={(event) => {
          if (type !== "number") return;
          if (["e", "E", "+", "-", "."].includes(event.key)) {
            event.preventDefault();
          }
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
          }
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        min={min}
        max={max}
        maxLength={type === "number" ? undefined : maxLength}
        required={required}
        className="h-9 w-full min-w-0 rounded-md border border-[var(--border-color)] bg-[var(--input-background)] px-2.5 text-[12px] text-[var(--text-color)] outline-none placeholder:text-[var(--secondary-text-color)] focus:border-[var(--accent-color)] read-only:cursor-default [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--border-color)] py-4 text-[11px]">
      <span className="shrink-0 text-[var(--secondary-text-color)]">
        {label}
      </span>

      <span className="max-w-[65%] break-words text-right text-xs font-bold text-[var(--text-color)]">
        {value}
      </span>
    </div>
  );
}

function EmptyGRNCard() {
  return (
    <aside className="flex min-h-[360px] min-w-0 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--input-background)] px-5 py-5 text-center md:mt-[4.5rem]">
      <FiFileText
        size={28}
        className="text-[var(--secondary-text-color)]"
      />
      <p className="max-w-[220px] text-xs text-[var(--secondary-text-color)]">
        Fill in the fields to create a GRN
      </p>
    </aside>
  );
}

function CreateGRN() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [createdGRN, setCreatedGRN] = useState(null);
  const [notes, setNotes] = useState("");

  const loadOrder = useCallback(async () => {
    if (!accessToken || !id) return;

    setLoading(true);

    try {
      const data = await getOrderDetails(accessToken, id);

      if (data.status !== "dispatched") {
        toast.error("Only dispatched orders can receive a GRN.");
        navigate("/goods-receipts", { replace: true });
        return;
      }

      setOrder(data);
      setItems(getInitialItems(data));
    } catch (error) {
      toast.error(error.message || "Unable to load order.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, id, navigate]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!order || submitting || createdGRN) return;

    for (const item of items) {
      if (item.received_quantity === "") {
        toast.error(`Enter received units for ${item.product_name}.`);
        return;
      }

      if (item.rejected_quantity === "") {
        toast.error(`Enter damaged units for ${item.product_name}.`);
        return;
      }

      const received = Number(item.received_quantity);
      const rejected = Number(item.rejected_quantity);

      if (
        !Number.isInteger(received) ||
        received < 0 ||
        received > item.dispatched_quantity
      ) {
        toast.error(
          `Enter a valid received quantity for ${item.product_name}.`
        );
        return;
      }

      if (!Number.isInteger(rejected) || rejected < 0 || rejected > received) {
        toast.error(
          `Damaged units cannot exceed received units for ${item.product_name}.`
        );
        return;
      }
    }

    if (
      items.reduce(
        (total, item) => total + Number(item.received_quantity),
        0
      ) <= 0
    ) {
      toast.error("At least one unit must be received.");
      return;
    }

    if (!notes.trim()) {
      toast.error("Please add a note.");
      return;
    }

    if (notes.length > 500) {
      toast.error("Note cannot exceed 500 characters.");
      return;
    }

    const grnData = {
      items: items.map((item) => ({
        purchase_order_item: item.purchase_order_item,
        received_quantity: Number(item.received_quantity),
        rejected_quantity: Number(item.rejected_quantity),
        note: "",
      })),
      notes: notes.trim(),
    };

    setSubmitting(true);

    try {
      const result = await createGRN(accessToken, id, grnData);

      toast.success(`GRN ${result.number} created successfully.`);
      setCreatedGRN(result || {});
    } catch (error) {
      toast.error(error.message || "Unable to create GRN.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--page-background)] p-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-5">
          <div className="h-5 w-24 rounded bg-[var(--input-background)]" />
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <div className="h-96 rounded-xl bg-[var(--card-background)]" />
            <div className="h-80 rounded-xl bg-[var(--card-background)]" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[var(--page-background)] p-8 text-center text-sm text-[var(--secondary-text-color)]">
        Order details could not be loaded.
      </div>
    );
  }

  const totalReceived = items.reduce(
    (total, item) => total + (Number(item.received_quantity) || 0),
    0
  );

  const totalDamaged = items.reduce(
    (total, item) => total + (Number(item.rejected_quantity) || 0),
    0
  );

  const totalExpired = Number(createdGRN?.expired_quantity ?? 0);
  const locked = Boolean(createdGRN);

  return (
    <div className="min-h-full bg-[var(--card-background)] px-4 py-5 text-[var(--text-color)] sm:px-6 sm:py-7">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/goods-receipts")}
          className="mb-8 inline-flex items-center text-[var(--text-color)] transition hover:opacity-70"
          aria-label="Go back"
        >
          <FiArrowLeft size={16} />
        </button>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1.1fr_1fr] md:gap-10">
            <div className="min-w-0 space-y-6">
              <InputField
                label="Order Number"
                value={order.number || ""}
                readOnly
                required
                maxLength={50}
              />

              {items.map((item, index) => (
                <div key={item.purchase_order_item} className="space-y-6">
                  <InputField
                    label="SKU Number"
                    value={item.sku || "—"}
                    readOnly
                    required
                    maxLength={50}
                  />

                  <InputField
                    label="Product Name"
                    value={item.product_name || ""}
                    readOnly
                    required
                    maxLength={150}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Received Units"
                      type="number"
                      placeholder="Enter stock size"
                      value={item.received_quantity}
                      onChange={(event) =>
                        updateItem(index, "received_quantity", event.target.value)
                      }
                      readOnly={locked}
                      min={0}
                      max={item.dispatched_quantity}
                      required
                    />

                    <InputField
                      label="Damaged Units"
                      type="number"
                      placeholder="Enter damaged units"
                      value={item.rejected_quantity}
                      onChange={(event) =>
                        updateItem(index, "rejected_quantity", event.target.value)
                      }
                      readOnly={locked}
                      min={0}
                      max={
                        item.received_quantity === ""
                          ? undefined
                          : Number(item.received_quantity)
                      }
                      required
                    />
                  </div>

                  {items.length > 1 && index < items.length - 1 && (
                    <div className="border-b border-[var(--border-color)]" />
                  )}
                </div>
              ))}

              <label className="block">
                <Label required>Note</Label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  readOnly={locked}
                  maxLength={500}
                  placeholder="Add a note..."
                  className="h-28 w-full resize-none rounded-md border border-[var(--border-color)] bg-[var(--input-background)] px-2.5 py-2.5 text-[10px] text-[var(--text-color)] outline-none placeholder:text-[var(--secondary-text-color)] focus:border-[var(--accent-color)]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || locked || items.length === 0}
                  className="h-9 min-w-[110px] rounded-md bg-[var(--accent-color)] px-6 text-[11px] font-semibold text-[var(--page-background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating" : "Create GRN"}
                </button>

                <button
                  type="button"
                  disabled={!locked}
                  onClick={() => toast("Payment integration will be added here.")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--input-background)] px-5 text-[11px] font-medium text-[var(--secondary-text-color)] transition hover:opacity-80 disabled:cursor-not-allowed"
                >
                  Pay <FiArrowRight size={13} />
                </button>
              </div>
            </div>

            {createdGRN ? (
              <aside className="min-w-0 rounded-xl bg-[var(--input-background)] px-5 py-5 md:mt-[4.5rem]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-color)]">
                      Order
                    </p>
                    <p className="mt-0.5 text-[9px] text-[var(--secondary-text-color)]">
                      #{order.number}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-[var(--text-color)]">
                    <img src={logo} alt="KOSH" className="h-6 w-auto" />
                  </div>
                </div>

                <h2 className="my-5 text-center text-sm font-bold text-[var(--text-color)]">
                  GRN
                </h2>

                <div className="flex items-start justify-between gap-4 pb-4">
                  <span className="shrink-0 text-[11px] text-[var(--secondary-text-color)]">
                    Order Items
                  </span>

                  <div className="max-w-[60%] space-y-1 text-right text-[12px] font-bold text-[var(--text-color)]">
                    {items.map((item) => (
                      <p key={item.purchase_order_item}>{item.product_name}</p>
                    ))}
                  </div>
                </div>

                <SummaryRow
                  label="Category"
                  value={items.length === 1 ? items[0].category : "Multiple"}
                />
                <SummaryRow label="Quantity" value={totalReceived} />
                <SummaryRow label="Damaged Units" value={totalDamaged} />
                <SummaryRow
                  label="Delivery Date"
                  value={formatDate(order.expected_delivery_date)}
                />
              </aside>
            ) : (
              <EmptyGRNCard />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGRN;