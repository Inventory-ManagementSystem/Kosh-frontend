function WarehouseTableSkeleton({ showDelete = true }) {
  return (
    <div className="animate-pulse overflow-x-auto px-3 pb-3 pt-4 sm:px-4">
      <table className="w-full min-w-175 table-fixed text-left">
        <thead>
          <tr className="bg-(--input-background) text-[10px] text-(--secondary-text-color)">
            <th className="px-3 py-3 font-medium">PRODUCT</th>
            <th className="px-3 py-3 font-medium">SKU</th>
            <th className="px-3 py-3 font-medium">CATEGORY</th>
            <th className="px-3 py-3 font-medium">STOCK</th>
            <th className="px-3 py-3 font-medium">PRICE</th>
            <th className="px-3 py-3 text-center font-medium">STATUS</th>
            {showDelete && (
              <th className="px-3 py-3 text-center font-medium">DELETE</th>
            )}
          </tr>
        </thead>

        <tbody>
          {[1, 2, 3, 4, 5].map((item) => (
            <tr
              key={item}
              className="border-b border-(--border-color) last:border-0"
            >
              <td className="px-3 py-4">
                <div className="h-3 w-24 rounded bg-(--border-color)" />
              </td>

              <td className="px-3 py-4">
                <div className="h-3 w-16 rounded bg-(--border-color)" />
              </td>

              <td className="px-3 py-4">
                <div className="h-3 w-20 rounded bg-(--border-color)" />
              </td>

              <td className="px-3 py-4">
                <div className="h-3 w-10 rounded bg-(--border-color)" />
              </td>

              <td className="px-3 py-4">
                <div className="h-3 w-12 rounded bg-(--border-color)" />
              </td>

              <td className="px-3 py-4">
                <div className="mx-auto h-5 w-16 rounded-full bg-(--border-color)" />
              </td>

              {showDelete && (
                <td className="px-3 py-4">
                  <div className="mx-auto h-3 w-3 rounded bg-(--border-color)" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WarehouseTableSkeleton;
