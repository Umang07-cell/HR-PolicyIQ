import { useAuthStore } from "../store/authStore";
import { usePermissions } from "../hooks/usePermissions";
import { StatCard } from "../components/ui/StatCard";
import { PageHeader } from "../components/ui/PageHeader";

const steps = [
  { key: "profile_complete", label: "Complete profile", desc: "Add your personal and contact details" },
  { key: "id_documents_uploaded", label: "Upload ID documents", desc: "Aadhaar, PAN, passport" },
  { key: "policies_attested", label: "Attest policies", desc: "Read and acknowledge mandatory policies" },
  { key: "it_setup_done", label: "IT setup", desc: "Laptop, email, access credentials" },
  { key: "bank_details_submitted", label: "Bank details", desc: "Account number for salary credit" },
  { key: "induction_completed", label: "Induction complete", desc: "Meet your team and HR orientation" },
];

const completed = ["profile_complete"]; // static for prototype

export default function OnboardingTracker() {
  const { user } = useAuthStore();
  const { isHRAdmin, isManager, isExecutive } = usePermissions();

  if (!user) return null;

  const doneCount = completed.length;
  const pct = Math.round((doneCount / steps.length) * 100);

  // Role-specific welcome
  const roleGreeting = isExecutive
    ? "Executive Dashboard"
    : isHRAdmin
    ? "HR Admin Dashboard"
    : isManager
    ? "Manager Dashboard"
    : "Employee Dashboard";

  const Icon = ({ path }: { path: string }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );

  return (
    <div className="p-6 max-w-5xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 shadow-lg shadow-blue-600/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{roleGreeting}</p>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user.full_name.split(" ")[0]}</h1>
            <p className="text-blue-300 text-sm mt-1">
              {user.department && `${user.department} · `}{user.location || ""}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Module Access"
          value="6"
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

      {/* Onboarding checklist */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Onboarding checklist</h2>
            <p className="text-xs text-slate-500 mt-0.5">{doneCount} of {steps.length} tasks complete</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-blue-600">{pct}%</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {steps.map((step, idx) => {
            const done = completed.includes(step.key);
            return (
              <div key={step.key} className={`flex items-center gap-4 px-6 py-4 ${done ? "bg-emerald-50/50" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
                {done ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Done</span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
