interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface DataTableProps {
  title: string;
  data: DataPoint[];
  columns: { key: string; label: string }[];
  visibleMetrics?: Set<string>;
}

export default function DataTable({
  title,
  data,
  columns,
  visibleMetrics,
}: DataTableProps) {
  const filteredColumns = visibleMetrics
    ? columns.filter((col) => col.key === "date" || visibleMetrics.has(col.key))
    : columns;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto max-h-64">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {filteredColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data
              .slice(-30)
              .reverse()
              .map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {filteredColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {typeof row[column.key] === "number"
                        ? row[column.key].toLocaleString()
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        直近30件を表示
      </div>
    </div>
  );
}
