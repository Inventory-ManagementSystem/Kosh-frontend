import { FiTrash2 } from "react-icons/fi";

function PeopleTable({ items, columns, onDelete, deletingId, getStatusClass }) {
  return (
    <div className="overflow-x-auto px-3 pb-3 pt-4 sm:px-4">
      <table className="w-full min-w-125 table-fixed text-left">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr className="rounded-lg bg-(--input-background) text-[10px] uppercase text-(--secondary-text-color)">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-medium ${
                  column.key === "status" ? "text-center" : ""
                }`}
              >
                {column.label}
              </th>
            ))}

            <th className="w-[15%] px-4 py-3 text-center font-medium">
              Delete
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-(--border-color) last:border-0"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3.5 text-xs text-(--text-color)"
                >
                  {column.key === "status" ? (
                    <div className="text-center">
                      <span
                        className={`inline-flex min-w-15.5 justify-center rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass?.(item.status) || ""}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ) : (
                    item[column.key] || "—"
                  )}
                </td>
              ))}

              <td className="px-4 py-3.5 text-center">
                <button
                  type="button"
                  title="Delete"
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item)}
                  className="inline-flex items-center justify-center rounded p-1 text-(--secondary-text-color) transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiTrash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PeopleTable;
