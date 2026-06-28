import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../store/uiStore";

const RoleBadge = ({ role }: { role: string }) => {
  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    employee: { bg: "bg-slate-700/60", text: "text-slate-300", dot: "bg-slate-400", label: "Employee" },
    manager: { bg: "bg-violet-900/50", text: "text-violet-300", dot: "bg-violet-400", label: "Manager" },
    hr_admin: { bg: "bg-blue-900/50", text: "text-blue-300", dot: "bg-blue-400", label: "HR Admin" },
    executive: { bg: "bg-amber-900/50", text: "text-amber-300", dot: "bg-amber-400", label: "Executive" },
  };
  const c = config[role] || config.employee;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav
      className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0 z-40"
      style={{ position: "sticky", top: 0 }}
    >
      {/* Left: toggle + logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-sm leading-none tracking-tight">HR Platform</span>
            {user?.department && (
              <span className="text-2xs text-slate-500 leading-none mt-0.5 hidden sm:block">{user.department}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: role badge + user menu */}
      <div className="flex items-center gap-3">
        {user && <RoleBadge role={user.role} />}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-3 border-l border-slate-800 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm text-slate-300 hidden md:block max-w-[120px] truncate">{user?.full_name}</span>
            <svg
              className={`w-3.5 h-3.5 text-slate-500 hidden md:block transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-elevated overflow-hidden z-50 animate-slide-up">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                {user?.location && (
                  <div className="px-4 py-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-xs text-slate-400">{user.location}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700 py-1">
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
