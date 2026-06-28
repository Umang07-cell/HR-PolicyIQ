import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const TEST_ACCOUNTS = [
  { role: "Employee", email: "employee@hr.com", pass: "employee123", color: "slate" },
  { role: "Manager", email: "manager@hr.com", pass: "manager123", color: "violet" },
  { role: "HR Admin", email: "hradmin@hr.com", pass: "admin123", color: "blue" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[22rem] animate-fade-in">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">HR Platform</h1>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to your workspace</p>
        </div>

        {/* Login card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-modal">
          {error && (
            <div className="mb-5 p-3 bg-red-950/60 border border-red-900/50 rounded-xl flex items-start gap-2.5 animate-fade-in">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-300 text-sm leading-snug">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500/50 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </div>
        </div>

        {/* Dev accounts */}
        <div className="mt-4 bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <p className="text-2xs font-semibold text-slate-500 uppercase tracking-widest">Dev accounts</p>
          </div>
          <div className="divide-y divide-slate-800">
            {TEST_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                onClick={() => setForm({ email: a.email, password: a.pass })}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800 transition-colors group"
              >
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{a.role}</span>
                <span className="text-2xs text-slate-600 font-mono">{a.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-2xs text-slate-700 mt-5">
          On-premise · Zero data egress · DPDP compliant
        </p>
      </div>
    </div>
  );
}
