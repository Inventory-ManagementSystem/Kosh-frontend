import { FiTrash2 } from "react-icons/fi";

function EmployeeTable({ employees, onDelete, deletingId }) {
  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "bg-[#26af41]/20 text-[#5fba71]";
    }
    if (status === "Pending") {
      return "bg-[#454645]/37 text-[var(--text-color)]";
    }
  };

  return (
    <div className="overflow-x-auto px-3 pb-3 pt-4 sm:px-4">
      <table className="w-full min-w-125 table-fixed text-left">
        <thead>
          <tr className="rounded-lg bg-(--input-background) text-[10px] uppercase text-(--secondary-text-color)">
            <th className="w-[35%] rounded-l-lg px-4 py-3 font-medium">Name</th>
            <th className="w-[27%] px-4 py-3 font-medium">Email</th>
            <th className="w-[23%] px-4 py-3 text-center font-medium">
              Status
            </th>
            <th className="w-[15%] rounded-r-lg px-4 py-3 text-center font-medium">
              Delete
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((item) => {
            const isDeleting = deletingId === item.id;

            return (
              <tr
                key={item.id}
                className="border-b border-(--border-color) last:border-0"
              >
                <td className="px-4 py-3.5 text-xs font-medium text-(--text-color)">
                  {item.name}
                </td>

                <td className="px-4 py-3.5 text-xs text-(--text-color)">
                  {item.email}
                </td>

                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex min-w-[62px] justify-center rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    title="Delete employee"
                    disabled={isDeleting}
                    onClick={() => onDelete(item)}
                    className="inline-flex items-center justify-center rounded p-1 text-(--secondary-text-color) transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
