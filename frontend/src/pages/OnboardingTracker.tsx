import { useAuthStore } from "../store/authStore";
import { usePermissions } from "../hooks/usePermissions";
import { StatCard } from "../components/ui/StatCard";
import { NavLink } from "react-router-dom";

const steps = [
  { key: "profile_complete", label: "Complete your profile", desc: "Add personal and contact details", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const completed = ["profile_complete"];

const quickLinks = [
  { to: "/chat", label: "Ask HR anything", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { to: "/policies", label: "Policies", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-amber-600 bg-amber-50 border-amber-100" },
];

const Icon = ({ path, className = "w-5 h-5" }: { path: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function OnboardingTracker() {
  const { user } = useAuthStore();
  const { isHRAdmin, isManager, isExecutive } = usePermissions();

  if (!user) return null;

  const doneCount = completed.length;
  const pct = Math.round((doneCount / steps.length) * 100);
  const firstName = user.full_name.split(" ")[0];

  const roleGreeting = isExecutive
    ? "Executive Dashboard"
    : isHRAdmin
    ? "HR Admin Dashboard"
    : isManager
    ? "Manager Dashboard"
    : "Employee Dashboard";

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 mb-6 shadow-lg shadow-blue-600/20">
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" aria-hidden />
        <div className="absolute right-12 -bottom-8 w-24 h-24 rounded-full bg-white/5" aria-hidden />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">{roleGreeting}</p>
            <h1 className="text-2xl font-bold text-white">Good morning, {firstName} 👋</h1>
            <p className="text-blue-300 text-sm mt-1.5">
              {user.department && `${user.department} · `}
              {user.location || ""}
            </p>
          </div>
          <div className="flex-shrink-0 hidden sm:block">
            <div className="text-right">
              <p className="text-blue-200 text-xs font-medium">Onboarding</p>
              <p className="text-3xl font-bold text-white tabular-nums">{pct}%</p>
            </div>
          </div>
        </div>

        {/* Onboarding progress bar */}
        <div className="relative mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-blue-300">{doneCount} of {steps.length} tasks complete</span>
            {pct < 100 && <span className="text-xs text-blue-400">{steps.length - doneCount} remaining</span>}
          </div>
          <div className="w-full bg-blue-900/50 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Module Access"
          value="8"
          color="blue"
          icon={<Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
        />
        <StatCard
          label="Onboarding"
          value={`${pct}%`}
          color="green"
          icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="Role"
          value={user.role.replace("_", " ")}
          color="purple"
          icon={<Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
        />
        <StatCard
          label="AI Queries"
          value="—"
          color="amber"
          icon={<Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding checklist */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card">
            <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Onboarding checklist</h2>
                <p className="text-xs text-slate-500 mt-0.5">{doneCount} of {steps.length} tasks complete</p>
              </div>
              <span className="text-sm font-bold text-blue-600">{pct}%</span>
            </div>
            <div className="divide-y divide-slate-50">
              {steps.map((step, idx) => {
                const done = completed.includes(step.key);
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${done ? "bg-emerald-50/60" : "hover:bg-slate-50/80"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                      {done ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? "text-emerald-700 line-through decoration-emerald-300" : "text-slate-800"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                    <div className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${done ? "text-emerald-700 bg-emerald-100" : "text-slate-500 bg-slate-100"}`}>
                      {done ? "Done" : "Pending"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {quickLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 bg-white border border-surface-border rounded-xl px-4 py-3.5 hover:shadow-card-hover transition-all duration-200 group"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${link.color}`}>
                  <Icon path={link.icon} className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{link.label}</span>
                <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
            ))}
          </div>

          {/* Tip card */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800">Try the HR Assistant</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">Get instant, policy-cited answers to any HR question.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
