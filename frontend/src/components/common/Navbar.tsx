import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../store/uiStore";
import { usePermissions } from "../../hooks/usePermissions";

const RoleBadge = ({ role }: { role: string }) => {
  const colors: Record<string, string> = {
    employee: "bg-slate-700 text-slate-200",
    manager: "bg-violet-900/60 text-violet-300",
    hr_admin: "bg-blue-900/60 text-blue-300",
    executive: "bg-amber-900/60 text-amber-300",
  };
  const labels: Record<string, string> = {
    employee: "Employee",
    manager: "Manager",
    hr_admin: "HR Admin",
    executive: "Executive",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[role] || "bg-slate-700 text-slate-200"}`}>
      {labels[role] || role}
    </span>
  );
};

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useUIStore();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <nav className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">HR Platform</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && <RoleBadge role={user.role} />}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm text-slate-300 hidden sm:block">{user?.full_name}</span>
          <button
            onClick={signOut}
            className="ml-1 text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};
