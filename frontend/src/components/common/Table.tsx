import { ReactNode } from "react";
import { EmptyState } from "../ui/EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyTitle = "No data found",
  emptyDescription,
}: {
  columns: Column<T>[];
  data: T[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

  return (
    <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-50">
          <thead>
            <tr className="bg-surface-secondary">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${alignClass[c.align ?? "left"]}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-surface-secondary transition-colors">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-sm text-slate-700 ${alignClass[c.align ?? "left"]}`}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} size="sm" />
      )}
    </div>
  );
}
