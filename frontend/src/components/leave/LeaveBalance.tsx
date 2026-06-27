export const LeaveBalance = ({ balance }: { balance: Record<string, { total: number; used: number; remaining: number }> }) => (
  <div className="grid grid-cols-2 gap-3">
    {Object.entries(balance).map(([type, b]) => (
      <div key={type} className="border rounded-lg p-3 bg-white">
        <p className="text-xs font-medium text-gray-500 uppercase">{type}</p>
        <p className="text-2xl font-bold text-blue-600">{b.remaining}</p>
        <p className="text-xs text-gray-400">{b.used} used / {b.total} total</p>
        <div className="mt-1 h-1.5 bg-gray-100 rounded"><div className="h-1.5 bg-blue-400 rounded" style={{ width: `${(b.remaining / b.total) * 100}%` }} /></div>
      </div>
    ))}
  </div>
);
