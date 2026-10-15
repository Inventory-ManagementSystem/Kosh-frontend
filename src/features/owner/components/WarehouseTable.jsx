import { FiTrash2 } from "react-icons/fi";

function WarehouseTable({ items, onDelete, deletingId, showDelete = true }) {
  const getStatusClass = (status) => {
    if (status === "In Stock") {
      return "bg-[#26af41]/30 text-[#5fba71]";
    }
    if (status === "Low Stock") {
      return "bg-[#e5d283]/30 text-[#ffae00]";
    }
    if (status === "Out of Stock") {
      return "bg-[#d3b484]/20 text-[#e65757]";
    }
    return "bg-(--input-background) text-(--secondary-text-color)";
  };

  return (
    <div className="overflow-x-auto px-3 pb-3 pt-4 sm:px-4">
      <table className="w-full min-w-175 table-fixed text-left">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[14%]" />
          <col className="w-[15%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className={showDelete ? "w-[15%]" : "w-[27%]"} />
          {showDelete && <col className="w-[12%]" />}
        </colgroup>

        <thead>
          <tr className="rounded-lg bg-(--input-background) text-[10px] uppercase text-(--secondary-text-color)">
            <th className="rounded-l-lg px-3 py-3 font-medium">Product</th>
            <th className="px-3 py-3 font-medium">SKU</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Stock</th>
            <th className="px-3 py-3 font-medium">Price</th>
            <th className="px-3 py-3 text-center font-medium">Status</th>
            {showDelete && (
              <th className="rounded-r-lg px-3 py-3 text-center font-medium">
                Delete
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-(--border-color) last:border-0"
            >
              <td className="px-3 py-3.5 text-xs text-(--text-color)">
                {item.name || "—"}
              </td>

              <td className="px-3 py-3.5 text-xs text-(--text-color)">
                {item.sku || "—"}
              </td>

              <td className="px-3 py-3.5 text-xs text-(--text-color)">
                {item.category_name || "—"}
              </td>

              <td className="px-3 py-3.5 text-xs text-(--text-color)">
                {item.quantity ?? "—"}
              </td>

              <td className="px-3 py-3.5 text-xs text-(--text-color)">
                {item.price != null
                  ? `\u20B9${Number(item.price).toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}`
                  : "—"}
              </td>

              <td className="px-3 py-3.5 text-center">
                <span
                  className={`inline-flex justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(item.status)}`}
                >
                  {item.status || "—"}
                </span>
              </td>

              {showDelete && (
                <td className="px-3 py-3.5 text-center">
                  <button
                    type="button"
                    title="Delete product"
                    disabled={deletingId === item.id}
                    onClick={() => onDelete?.(item)}
                    className="inline-flex items-center justify-center rounded p-1 text-(--secondary-text-color) transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WarehouseTable;
