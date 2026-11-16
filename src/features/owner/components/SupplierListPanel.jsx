import { useEffect, useRef } from "react";
import { ListError, ListSkeleton, NoSuppliersState } from "./SupplierMapStates";

const NEXT_RADIUS = { 5: 10, 10: 50 };

function SupplierListPanel({
  radius,
  loading,
  error,
  suppliers,
  selectedId,
  categoryName,
  onSelect,
  onSendRfq,
  onRetry,
  onChangeRadius,
  onClearCategory,
}) {
  const rowRefs = useRef({});

  useEffect(() => {
    if (selectedId) {
      rowRefs.current[selectedId]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedId]);

  const renderBody = () => {
    if (loading && suppliers.length === 0) return <ListSkeleton />;
    if (error) return <ListError message={error.message} onRetry={onRetry} />;
    if (suppliers.length === 0) {
      return (
        <NoSuppliersState
          radius={radius}
          categoryName={categoryName}
          nextRadius={NEXT_RADIUS[radius]}
          onTryRadius={onChangeRadius}
          onClearCategory={onClearCategory}
        />
      );
    }
    return (
      <ul className="flex-1 overflow-y-auto">
        {suppliers.map((supplier) => {
          const isSelected = supplier.id === selectedId;
          return (
            <li
              key={supplier.id}
              ref={(el) => {
                rowRefs.current[supplier.id] = el;
              }}
              onClick={() => onSelect(supplier.id)}
              className={`cursor-pointer border-b border-l-2 border-b-(--border-color) px-4 py-3 transition last:border-b-0 hover:bg-(--sidebar-hover-background) ${
                isSelected
                  ? "border-l-(--accent-color) bg-(--sidebar-active-background)"
                  : "border-l-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-(--text-color)">
                    {supplier.company_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-(--secondary-text-color)">
                    {(supplier.category_names || []).join(", ") || "—"}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-(--text-color)">
                  {Number(supplier.distance_km).toFixed(1)} km
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                    supplier.in_my_suppliers
                      ? "bg-(--success-background) text-(--success-color)"
                      : "bg-(--sidebar-active-background) text-(--accent-color)"
                  }`}
                >
                  {supplier.in_my_suppliers ? "My supplier" : "Kosh supplier"}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSendRfq(supplier);
                  }}
                  className="cursor-pointer text-xs font-semibold text-(--text-color) transition hover:text-(--accent-color)"
                >
                  Send RFQ →
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside className="flex h-96 flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--card-background) lg:h-136">
      <div className="flex items-center justify-between border-b border-(--border-color) px-4 py-3 text-xs">
        <span className="font-semibold text-(--text-color)">
          Within {radius} km
        </span>
        <span className="text-(--secondary-text-color)">
          {suppliers.length} supplier{suppliers.length === 1 ? "" : "s"} ·
          nearest first
        </span>
      </div>
      {renderBody()}
      <p className="border-t border-(--border-color) px-4 py-3 text-[10px] text-(--secondary-text-color)">
        Only verified suppliers whose address is on the map are shown. Distances
        are straight-line.
      </p>
    </aside>
  );
}

export default SupplierListPanel;
