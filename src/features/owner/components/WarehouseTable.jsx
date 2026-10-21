import { FiTrash2 } from "react-icons/fi";
import { BsFillSendFill } from "react-icons/bs";

function WarehouseTable({
  items = [],
  onDelete,
  deletingId,
  showDelete = true,
  variant = "warehouse",
  onDispatch,
  onOrderClick,
}) {
  const isDispatch = variant === "dispatch";
  const isOrders = variant === "orders";

  const getOrderStatus = (status) => {
    const statuses = {
      awaiting_advance: "Awaiting Advance",
      issued: "Issued",
      dispatched: "Dispatched",
      partially_received: "Partially Received",
      received: "Received",
      cancelled: "Cancelled",
    };

    return statuses[status] || status || "—";
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "")
      .toLowerCase()
      .replaceAll("_", " ");

    if (isOrders) {
      if (normalized === "received") {
        return "bg-[#26af41]/20 text-[#5fba71]";
      }

      if (["dispatched", "partially received"].includes(normalized)) {
        return "bg-[#e5d283]/20 text-[#ffae00]";
      }

      if (normalized === "cancelled") {
        return "bg-[#e65757]/15 text-[#e65757]";
      }

      if (normalized === "issued") {
        return "bg-(--input-background) text-(--accent-color)";
      }

      if (normalized === "awaiting advance") {
        return "bg-(--input-background) text-(--secondary-text-color)";
      }

      return "bg-(--input-background) text-(--secondary-text-color)";
    }

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

  const formatPrice = (price) => {
    if (price == null || price === "") return "—";

    const amount = Number(price);

    if (!Number.isFinite(amount)) return "—";

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="overflow-x-auto px-3 pb-3 pt-4 sm:px-4">
      <table
        className={`w-full table-fixed text-left ${
          isOrders ? "min-w-[620px]" : "min-w-[700px]"
        }`}
      >
        {isOrders ? (
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[28%]" />
            <col className="w-[20%]" />
            <col className="w-[17%]" />
            <col className="w-[18%]" />
          </colgroup>
        ) : (
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
            {(isDispatch || showDelete) && <col className="w-[12%]" />}
          </colgroup>
        )}

        <thead>
          <tr className="rounded-lg bg-(--input-background) text-[10px] uppercase text-(--secondary-text-color)">
            {isOrders ? (
              <>
                <th className="rounded-l-lg px-3 py-3 font-medium">Order ID</th>
                <th className="px-3 py-3 font-medium">Supplying Agency</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="rounded-r-lg px-3 py-3 text-center font-medium">
                  Status
                </th>
              </>
            ) : (
              <>
                <th className="rounded-l-lg px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">SKU</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 text-center font-medium">Status</th>

                {(isDispatch || showDelete) && (
                  <th className="rounded-r-lg px-3 py-3 text-center font-medium">
                    {isDispatch ? "Dispatch" : "Delete"}
                  </th>
                )}
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={isOrders ? () => onOrderClick?.(item) : undefined}
              tabIndex={isOrders ? 0 : undefined}
              onKeyDown={
                isOrders
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOrderClick?.(item);
                      }
                    }
                  : undefined
              }
              className={`border-b border-(--border-color) last:border-0 ${
                isOrders
                  ? "cursor-pointer transition hover:bg-(--input-background)/60 focus-visible:outline focus-visible:outline-(--accent-color)"
                  : ""
              }`}
            >
              {isOrders ? (
                <>
                  <td className="whitespace-nowrap px-3 py-4 text-xs text-(--secondary-text-color)">
                    {item.number || "—"}
                  </td>
                  <td className="px-3 py-4 text-xs text-(--text-color)">
                    {item.company_name || "—"}
                  </td>
                  <td className="px-3 py-4 text-xs text-(--text-color)">
                    {item.category_name || item.category || "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs text-(--text-color)">
                    {formatPrice(item.grand_total)}
                  </td>
                  <td className="px-2 py-4 text-center">
                    <span
                      className={`inline-flex max-w-full justify-center whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-medium sm:px-2.5 sm:text-[10px] ${getStatusClass(
                        item.status,
                      )}`}
                    >
                      {getOrderStatus(item.status)}
                    </span>
                  </td>
                </>
              ) : (
                <>
                  <td className="truncate px-3 py-3.5 text-xs text-(--text-color)">
                    {item.name || "—"}
                  </td>
                  <td className="truncate px-3 py-3.5 text-xs text-(--text-color)">
                    {item.sku || "—"}
                  </td>
                  <td className="truncate px-3 py-3.5 text-xs text-(--text-color)">
                    {item.category_name || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-xs text-(--text-color)">
                    {item.quantity ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs text-(--text-color)">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-flex justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(
                        item.status,
                      )}`}
                    >
                      {item.status || "—"}
                    </span>
                  </td>

                  {isDispatch ? (
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        title={`Dispatch ${item.name || "product"}`}
                        onClick={() => onDispatch?.(item)}
                        className="inline-flex items-center justify-center rounded p-1 text-(--accent-color) transition hover:bg-(--input-background) hover:opacity-75"
                      >
                        <BsFillSendFill size={13} />
                      </button>
                    </td>
                  ) : (
                    showDelete && (
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
                    )
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WarehouseTable;
