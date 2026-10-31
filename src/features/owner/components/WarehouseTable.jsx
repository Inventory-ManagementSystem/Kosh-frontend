import { useEffect, useRef, useState } from "react";
import { IoMdMore } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";
import ConfirmDelete from "../components/ConfirmDelete";

function WarehouseTable({
  items = [],
  onDelete,
  onEdit,
  deletingId,
  showDelete = true,
  variant = "warehouse",
  onDispatch,
  onReactivate,
  onOrderClick,
  deleteDescription,
}) {
  const isDispatch = variant === "dispatch";
  const isOrders = variant === "orders";

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
        return "bg-[#26af41]/20 text-[#18903f]";
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

      return "bg-(--input-background) text-(--secondary-text-color)";
    }

    if (status === "In Stock") {
      return "bg-[#26af41]/30 text-[#18903f]";
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

  const handleEdit = (item) => {
    setOpenMenuId(null);
    onEdit?.(item);
  };
  const handleDelete = (item) => {
    setOpenMenuId(null);
    setSelectedItem(item);
  };
  const handleCancelDelete = () => {
    if (deletingId === selectedItem?.id) return;
    setSelectedItem(null);
  };
  const handleConfirmDelete = () => {
    if (!selectedItem || deletingId === selectedItem.id) return;
    onDelete?.(selectedItem);
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
                  <th className="rounded-r-lg px-2 py-3 text-center font-medium">
                    {isDispatch ? "Dispatch" : ""}
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
              className={`group border-b border-(--border-color) last:border-0 ${
                isOrders
                  ? "cursor-pointer transition hover:bg-(--input-background)/60 focus-visible:outline focus-visible:outline-(--accent-color)"
                  : "transition-colors hover:bg-(--input-background)/40"
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
                      <td className="px-2 py-3.5 text-center">
                        <div
                          className="relative flex items-center justify-center"
                          ref={openMenuId === item.id ? menuRef : null}
                        >
                          <button
                            type="button"
                            title="Product actions"
                            aria-label={`Actions for ${item.name || "product"}`}
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === item.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenuId((currentId) =>
                                currentId === item.id ? null : item.id,
                              );
                            }}
                            className={`inline-flex items-center justify-center rounded-md p-1.5 text-(--secondary-text-color) transition hover:bg-(--input-background) hover:text-(--text-color) focus-visible:outline focus-visible:outline-(--accent-color) ${
                              openMenuId === item.id
                                ? "opacity-100"
                                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                            }`}
                          >
                            <IoMdMore size={16} />
                          </button>

                          {openMenuId === item.id && (
                            <div
                              role="menu"
                              className="absolute right-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-lg border border-(--border-color) bg-(--dropdown-background) p-1 shadow-xl"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleEdit(item);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-(--text-color) transition hover:bg-(--input-background)"
                              >
                                Edit
                              </button>
                              {item.is_active === false ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={deletingId === item.id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenMenuId(null);
                                    onReactivate?.(item);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-(--text-color) transition hover:bg-(--input-background)"
                                >
                                  {deletingId === item.id
                                    ? "Reactivating"
                                    : "Reactivate"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={deletingId === item.id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDelete(item);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId === item.id
                                    ? "Deleting"
                                    : "Delete"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmDelete
        isOpen={Boolean(selectedItem)}
        itemType="product"
        itemName={selectedItem?.name || ""}
        description={deleteDescription}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deletingId === selectedItem?.id}
      />
    </div>
  );
}

export default WarehouseTable;
