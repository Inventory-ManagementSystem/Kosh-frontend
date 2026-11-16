import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { FaPaperPlane } from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";
import { getProducts } from "../api/warehouseApi";
import { getNearbySuppliers, sendDirectRfq } from "../api/supplierMapApi";
import RfqSentPopup from "../components/RfqSentPopup";

const PRODUCT_LIMIT = 100;
const ROW_GRID =
  "grid grid-cols-[20px_minmax(0,1fr)_72px_110px] items-center gap-4";

const getProductCategory = (product) =>
  product.supply_category_name || product.category_name || "";
const isLowStock = (product) => product.status === "Low Stock";
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

function SendRfq() {
  const { accessToken } = useAuth();
  const { supplierId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(location.state?.supplier ?? null);
  const [warehouseName, setWarehouseName] = useState(
    location.state?.warehouseName ?? "",
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentRfqs, setSentRfqs] = useState(null);

  const backToMap = () => navigate("/supplier-map");
  useEffect(() => {
    if (supplier || !accessToken) return;
    let cancelled = false;
    const loadSupplier = async () => {
      try {
        const result = await getNearbySuppliers(accessToken, { radius: 50 });
        if (cancelled) return;
        const found = result.results.find((item) => item.id === supplierId);
        if (!found) {
          toast.error("That supplier is not on your map.");
          navigate("/supplier-map", { replace: true });
          return;
        }
        setSupplier(found);
        setWarehouseName(result.origin?.name || "");
      } catch (error) {
        if (cancelled) return;
        toast.error(error.message || "Failed to load supplier.");
        navigate("/supplier-map", { replace: true });
      }
    };
    loadSupplier();
    return () => {
      cancelled = true;
    };
  }, [accessToken, supplier, supplierId, navigate]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    const loadProducts = async () => {
      try {
        const response = await getProducts(
          accessToken,
          1,
          PRODUCT_LIMIT,
          "",
          "true",
        );
        if (!cancelled) setProducts(response.data?.results || []);
      } catch (error) {
        if (!cancelled)
          toast.error(error.message || "Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const sellable = useMemo(() => {
    if (!supplier) return [];
    const sold = new Set(
      (supplier.category_names || []).map((name) => name.toLowerCase()),
    );
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (!sold.has(getProductCategory(product).toLowerCase())) return false;
      if (!term) return true;
      return (
        String(product.name || "")
          .toLowerCase()
          .includes(term) ||
        String(product.sku || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [products, supplier, search]);

  const selectedProducts = products.filter((product) => product.id in selected);
  const items = selectedProducts.map((product) => ({
    product: product.id,
    quantity: Number(selected[product.id]),
  }));
  const isValid =
    items.length > 0 &&
    items.every((item) => Number.isInteger(item.quantity) && item.quantity > 0);
  const totalUnits = items.reduce(
    (sum, item) => sum + (item.quantity > 0 ? item.quantity : 0),
    0,
  );
  const rfqCategories = [
    ...new Set(selectedProducts.map(getProductCategory).filter(Boolean)),
  ];

  const toggleProduct = (productId) => {
    setSelected((previous) => {
      const next = { ...previous };
      if (productId in next) delete next[productId];
      else next[productId] = "";
      return next;
    });
  };

  const setQuantity = (productId, value) => {
    setSelected((previous) => ({
      ...previous,
      [productId]: value.replace(/\D/g, "").slice(0, 7),
    }));
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    try {
      setSubmitting(true);
      const payload = { supplier: supplier.id, items };
      if (notes.trim()) payload.notes = notes.trim();
      const rfqs = await sendDirectRfq(accessToken, payload);
      setSentRfqs(rfqs || []);
    } catch (error) {
      toast.error(error.message || "Failed to send RFQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRfq = () => {
    if (sentRfqs?.length === 1) {
      navigate(`/manage-quotation/${sentRfqs[0].id}`);
    } else {
      navigate("/rfq-alerts");
    }
  };

  if (!supplier) {
    return (
      <p className="py-20 text-center text-xs text-(--secondary-text-color)">
        Loading supplier…
      </p>
    );
  }

  const place = [supplier.city, supplier.pincode].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={backToMap}
        className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-(--secondary-text-color) transition hover:text-(--text-color)"
      >
        <FiArrowLeft size={14} />
        Back to map
      </button>

      <h1 className="mt-3 text-2xl font-bold text-(--text-color)">Send RFQ</h1>
      <p className="mt-1 text-xs text-(--secondary-text-color)">
        Choose the products you want quotes for and how many units of each.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--success-color) text-sm font-bold text-(--page-background)">
          {getInitials(supplier.company_name)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-(--text-color)">
            <span className="truncate">{supplier.company_name}</span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                supplier.in_my_suppliers
                  ? "bg-(--success-background) text-(--success-color)"
                  : "bg-(--sidebar-active-background) text-(--accent-color)"
              }`}
            >
              {supplier.in_my_suppliers ? "My supplier" : "Kosh supplier"}
            </span>
          </p>
          <p className="mt-0.5 truncate text-xs text-(--secondary-text-color)">
            {(supplier.category_names || []).join(", ")}
            {place && ` · ${place}`} · {Number(supplier.distance_km).toFixed(1)}{" "}
            km from {warehouseName || "your warehouse"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-(--secondary-text-color)">
          Products in categories this supplier sells
        </p>
        <div className="relative">
          <FiSearch
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--secondary-text-color)"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="h-9 w-52 rounded-lg border border-(--border-color) bg-(--input-background) pl-8 pr-2 text-xs text-(--text-color) outline-none focus:border-(--accent-color)"
          />
        </div>
      </div>

      <div
        className={`${ROW_GRID} mt-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-(--secondary-text-color)`}
      >
        <span />
        <span>Product</span>
        <span>In stock</span>
        <span>Quantity</span>
      </div>

      <div className="mt-2 space-y-2">
        {loading ? (
          <p className="py-10 text-center text-xs text-(--secondary-text-color)">
            Loading products…
          </p>
        ) : sellable.length === 0 ? (
          <p className="py-10 text-center text-xs text-(--secondary-text-color)">
            No products in categories this supplier sells.
          </p>
        ) : (
          sellable.map((product) => {
            const checked = product.id in selected;
            return (
              <div
                key={product.id}
                className={`${ROW_GRID} rounded-xl border px-4 py-3 transition ${
                  checked
                    ? "border-(--accent-color)/40 bg-(--card-background)"
                    : "border-(--border-color) bg-(--card-background)/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleProduct(product.id)}
                  className="h-4 w-4 cursor-pointer accent-(--accent-color)"
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-(--text-color)">
                    <span className="truncate">{product.name}</span>
                    {isLowStock(product) && (
                      <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                        Low stock · alert open
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-(--secondary-text-color)">
                    {product.sku}
                  </p>
                </div>
                <span className="text-sm font-bold text-(--text-color)">
                  {product.quantity ?? "—"}
                </span>
                <input
                  inputMode="numeric"
                  value={selected[product.id] ?? ""}
                  disabled={!checked}
                  onChange={(event) =>
                    setQuantity(product.id, event.target.value)
                  }
                  placeholder="100"
                  className="h-9 w-full rounded-lg border border-(--border-color) bg-(--input-background) px-3 text-xs text-(--text-color) outline-none focus:border-(--accent-color) disabled:opacity-40"
                />
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <label
          htmlFor="rfq-notes"
          className="text-xs font-semibold text-(--text-color)"
        >
          Notes for the supplier{" "}
          <span className="font-normal text-(--secondary-text-color)">
            (optional)
          </span>
        </label>
        <textarea
          id="rfq-notes"
          value={notes}
          maxLength={400}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Delivery instructions, preferred brands, packaging…"
          className="mt-2 w-full resize-none rounded-lg border border-(--border-color) bg-(--input-background) px-3 py-2 text-xs text-(--text-color) outline-none focus:border-(--accent-color)"
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-(--border-color) bg-(--card-background) px-5 py-4">
        <div className="min-w-0 text-xs">
          <p className="font-bold text-(--text-color)">
            {items.length} product{items.length === 1 ? "" : "s"} · {totalUnits}{" "}
            units
          </p>
          <p className="mt-0.5 text-[11px] text-(--secondary-text-color)">
            {rfqCategories.length} RFQ{rfqCategories.length === 1 ? "" : "s"}
            {rfqCategories.length > 0 && ` (${rfqCategories.join(", ")})`} ·
            quotes due 3 days after sending
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={backToMap}
            disabled={submitting}
            className="h-10 cursor-pointer rounded-xl border border-(--border-color) px-5 text-xs font-semibold text-(--text-color) transition hover:bg-(--sidebar-hover-background)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-(--accent-color) px-5 text-xs font-semibold text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaPaperPlane size={11} />
            {submitting ? "Sending…" : "Send RFQ"}
          </button>
        </div>
      </div>

      {sentRfqs && (
        <RfqSentPopup
          supplier={supplier}
          rfqs={sentRfqs}
          onBack={backToMap}
          onView={handleViewRfq}
        />
      )}
    </div>
  );
}

export default SendRfq;
