interface Column<T> { key: string; label: string; render?: (row: T) => React.ReactNode; }
export function Table<T extends Record<string, any>>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{c.label}</th>)}</tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((c) => <td key={c.key} className="px-4 py-3 text-sm text-gray-700">{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p className="text-center text-gray-400 py-8">No data found.</p>}
    </div>
  );
}
