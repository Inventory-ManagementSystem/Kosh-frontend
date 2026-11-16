import { FiX } from "react-icons/fi";
import { FaPaperPlane } from "react-icons/fa";

function SupplierInfoCard({ supplier, onSendRfq, onClose }) {
  const location = [supplier.city, supplier.pincode].filter(Boolean).join(" ");

  return (
    <div className="w-60 p-4 text-[#0b0f23]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{supplier.company_name}</p>
          {location && (
            <p className="mt-0.5 text-xs text-gray-500">{location}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 cursor-pointer text-gray-500 transition hover:text-black"
        >
          <FiX size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
            supplier.in_my_suppliers
              ? "bg-[#d4f5e2] text-[#0d8a4a]"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {supplier.in_my_suppliers ? "My supplier" : "Kosh supplier"}
        </span>
        {(supplier.category_names || []).map((name) => (
          <span
            key={name}
            className="rounded bg-[#dde6ff] px-2 py-0.5 text-[10px] font-semibold text-[#3550a8]"
          >
            {name}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">Distance from warehouse</span>
        <span className="font-bold">
          {Number(supplier.distance_km).toFixed(1)} km
        </span>
      </div>

      <button
        type="button"
        onClick={onSendRfq}
        className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2f3b73] text-xs font-semibold text-white transition hover:bg-[#3a4890]"
      >
        <FaPaperPlane size={11} />
        Send RFQ
      </button>
    </div>
  );
}

export default SupplierInfoCard;
