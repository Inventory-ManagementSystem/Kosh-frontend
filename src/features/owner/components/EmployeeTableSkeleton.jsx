function EmployeeTableSkeleton() {
  return (
    <div className="animate-pulse overflow-x-auto px-3 pb-3 pt-4 sm:px-4">
      <table className="w-full min-w-125 table-fixed text-left">
        <thead>
          <tr className="bg-(--input-background) text-[10px] text-(--secondary-text-color)">
            <th className="w-[35%] rounded-l-lg px-4 py-3 font-medium">NAME</th>
            <th className="w-[27%] px-4 py-3 font-medium">EMAIL</th>
            <th className="w-[23%] px-4 py-3 text-center font-medium">
              STATUS
            </th>
            <th className="w-[15%] rounded-r-lg px-4 py-3 text-center font-medium">
              DELETE
            </th>
          </tr>
        </thead>

        <tbody>
          {[1, 2, 3, 4, 5].map((item) => (
            <tr
              key={item}
              className="border-b border-(--border-color) last:border-0"
            >
              <td className="px-4 py-4">
                <div className="h-3 w-24 rounded bg-(--border-color)" />
              </td>
              <td className="px-4 py-4">
                <div className="h-3 w-28 rounded bg-(--border-color)" />
              </td>
              <td className="px-4 py-4">
                <div className="mx-auto h-5 w-16 rounded-full bg-(--border-color)" />
              </td>
              <td className="px-4 py-4">
                <div className="mx-auto h-3 w-3 rounded bg-(--border-color)" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTableSkeleton;
