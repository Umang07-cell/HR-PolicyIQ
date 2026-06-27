import { useState, useEffect, useCallback } from "react";
import { getMyPayslips } from "../api/payroll";
import { PageHeader } from "../components/ui/PageHeader";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useNotificationStore } from "../store/notificationStore";
import { PayrollRecord } from "../types/models";
import { formatMonth } from "../utils/formatters";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const BreakdownRow = ({ label, value, variant = "neutral" }: { label: string; value: number; variant?: "positive" | "negative" | "neutral" }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-600">{label}</span>
    <span className={`text-sm font-semibold ${variant === "positive" ? "text-emerald-600" : variant === "negative" ? "text-red-500" : "text-slate-800"}`}>
      {variant === "negative" ? "−" : ""}{formatINR(Math.abs(value))}
    </span>
  </div>
);

export default function PayrollPage() {
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getMyPayslips();
      setPayslips(r.data);
    } catch {
      notify("Failed to load payslips", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader
        title="Payroll"
        subtitle="Your salary statements and compensation breakdown"
      />

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : payslips.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            title="No payslips yet"
            description="Your payslips will appear here once payroll is processed."
            icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {payslips.map((p) => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{formatMonth(p.month)}</p>
                      <p className="text-xs text-slate-400">Payslip</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{formatINR(p.net_salary)}</p>
                      <p className="text-xs text-slate-400">Net salary</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded breakdown */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Breakdown</p>
                    <BreakdownRow label="Basic Salary" value={p.basic} variant="positive" />
                    <BreakdownRow label="HRA" value={p.hra} variant="positive" />
                    <BreakdownRow label="Allowances" value={p.allowances} variant="positive" />
                    <BreakdownRow label="Deductions" value={p.deductions} variant="negative" />
                    <BreakdownRow label="Tax Deducted (TDS)" value={p.tax_deducted} variant="negative" />
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-200">
                      <span className="text-sm font-bold text-slate-900">Net Salary</span>
                      <span className="text-base font-bold text-emerald-600">{formatINR(p.net_salary)}</span>
                    </div>
                    <button
                      onClick={() => {
                        const content = [
                          `Payslip — ${formatMonth(p.month)}`,
                          `Basic: ${formatINR(p.basic)}`,
                          `HRA: ${formatINR(p.hra)}`,
                          `Allowances: ${formatINR(p.allowances)}`,
                          `Deductions: -${formatINR(p.deductions)}`,
                          `TDS: -${formatINR(p.tax_deducted)}`,
                          `Net Salary: ${formatINR(p.net_salary)}`,
                        ].join("\n");
                        const blob = new Blob([content], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `payslip-${p.month}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Payslip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
