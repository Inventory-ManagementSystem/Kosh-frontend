import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaWarehouse } from "react-icons/fa6";

import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import Dropdown from "../../../components/common/Dropdown";
import { getWarehouse, getCategories } from "../api/warehouseApi";
import { useNearbySuppliers } from "../hooks/useNearbySuppliers";
import SupplierListPanel from "../components/SupplierListPanel";
import { WarehouseNotFoundState } from "../components/SupplierMapStates";
import EditWarehouseModal from "../components/EditWarehouseModal";
import SupplierMapView from "../components/SupplierMapView";

const RADIUS_OPTIONS = [5, 10, 50];

const SOURCE_OPTIONS = [
  { value: "all", label: "All suppliers" },
  { value: "mine", label: "My suppliers" },
  { value: "platform", label: "Other Kosh suppliers" },
];

function SupplierMap() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { themes } = useTheme();
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [categories, setCategories] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditingWarehouse, setIsEditingWarehouse] = useState(false);

  const { data, loading, error, reload } = useNearbySuppliers(accessToken, {
    radius,
    category: category === "all" ? "" : category,
    source,
  });

  const suppliers = useMemo(() => data?.results ?? [], [data]);
  const warehouseMissing = error?.status === 400;

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    Promise.allSettled([
      getCategories(accessToken),
      getWarehouse(accessToken),
    ]).then(([categoriesResult, warehouseResult]) => {
      if (cancelled) return;
      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value.data || []);
      }
      if (warehouseResult.status === "fulfilled") {
        setWarehouse(warehouseResult.value.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (error && error.status !== 400) {
      toast.error(error.message || "Failed to load nearby suppliers.");
    }
  }, [error]);

  useEffect(() => {
    setSelectedId(null);
  }, [data]);

  const handleWarehouseSaved = (updated) => {
    setWarehouse(updated);
    setIsEditingWarehouse(false);
    reload();
  };

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((item) => ({ value: item.id, label: item.name })),
  ];
  const categoryName =
    category === "all"
      ? ""
      : categories.find((item) => String(item.id) === category)?.name || "";

  const handleSendRfq = (supplier) =>
    navigate(`/supplier-map/rfq/${supplier.id}`, {
      state: { supplier, warehouseName: warehouse?.name },
    });

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-color)">
            Supplier Map
          </h1>
          <p className="mt-1 text-xs text-(--secondary-text-color)">
            Verified suppliers near your warehouse. Pick one to send them an
            RFQ.
          </p>
        </div>

        {warehouse && (
          <div className="flex items-center gap-3 rounded-xl border border-(--border-color) bg-(--card-background) px-4 py-3">
            <FaWarehouse size={16} className="text-(--secondary-text-color)" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-(--text-color)">
                {warehouse.name || "Your warehouse"}
              </p>
              <p className="max-w-64 truncate text-[11px] text-(--secondary-text-color)">
                {warehouse.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingWarehouse(true)}
              className="ml-2 cursor-pointer text-[11px] font-semibold text-(--accent-color) underline"
            >
              Edit address
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-(--border-color) p-0.5">
          {RADIUS_OPTIONS.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setRadius(km)}
              className={`h-7 cursor-pointer rounded-full px-4 text-xs font-semibold transition ${
                radius === km
                  ? "bg-(--accent-color) text-(--page-background)"
                  : "text-(--secondary-text-color) hover:text-(--text-color)"
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
        <Dropdown
          size="sm"
          className="w-44"
          value={category}
          options={categoryOptions}
          onChange={(event) => setCategory(event.target.value)}
        />
        <Dropdown
          size="sm"
          className="w-48"
          value={source}
          options={SOURCE_OPTIONS}
          onChange={(event) => setSource(event.target.value)}
        />
      </div>

      {warehouseMissing ? (
        <WarehouseNotFoundState onEdit={() => setIsEditingWarehouse(true)} />
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="h-96 overflow-hidden rounded-xl border border-(--border-color) bg-(--card-background) lg:h-136">
            {data?.origin ? (
              <SupplierMapView
                origin={data.origin}
                radiusKm={radius}
                suppliers={suppliers}
                selectedId={selectedId}
                dark={themes.owner === "dark"}
                onSelect={setSelectedId}
                onSendRfq={handleSendRfq}
              />
            ) : (
              <div className="flex h-full animate-pulse items-center justify-center text-xs text-(--secondary-text-color)">
                {loading ? "Loading map…" : "Map unavailable"}
              </div>
            )}
          </div>

          <SupplierListPanel
            radius={radius}
            loading={loading}
            error={error}
            suppliers={suppliers}
            selectedId={selectedId}
            categoryName={categoryName}
            onSelect={setSelectedId}
            onSendRfq={handleSendRfq}
            onRetry={reload}
            onChangeRadius={setRadius}
            onClearCategory={() => setCategory("all")}
          />
        </div>
      )}

      {isEditingWarehouse && (
        <EditWarehouseModal
          warehouse={warehouse}
          accessToken={accessToken}
          onClose={() => setIsEditingWarehouse(false)}
          onSaved={handleWarehouseSaved}
        />
      )}
    </div>
  );
}

export default SupplierMap;
