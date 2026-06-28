import { NavLink, useLocation } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuthStore } from "../../store/authStore";

interface NavItem {
  to: string;
  label: string;
  icon: string; // SVG path
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    to: "/chat",
    label: "HR Assistant",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    to: "/leave",
    label: "Leave",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    to: "/payroll",
    label: "Payroll",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    to: "/performance",
    label: "Performance",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    to: "/grievance",
    label: "Grievance",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  {
    to: "/recruitment",
    label: "Recruitment",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    to: "/policies",
    label: "Policies",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const MANAGER_ITEMS: NavItem[] = [
  {
    to: "/manager",
    label: "Team Overview",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
];

const ADMIN_ITEMS: NavItem[] = [
  {
    to: "/admin",
    label: "Admin Panel",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

const NavIcon = ({ path }: { path: string }) => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={path} />
  </svg>
);

const SidebarLink = ({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) => (
  <NavLink
    to={item.to}
    end={item.to === "/"}
    title={collapsed ? item.label : undefined}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 mx-2 rounded-lg transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
        collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2"
      } ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Active indicator */}
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-300 rounded-r-full -ml-2" />
        )}
        <NavIcon path={item.icon} />
        {!collapsed && (
          <span className="text-sm font-medium flex-1">{item.label}</span>
        )}
        {!collapsed && item.badge !== undefined && item.badge > 0 && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>
            {item.badge}
          </span>
        )}
        {/* Tooltip for collapsed mode */}
        {collapsed && (
          <div className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-800 text-slate-100 text-xs font-medium rounded-lg shadow-elevated whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100 z-50 border border-slate-700">
            {item.label}
            <span className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-slate-800" />
          </div>
        )}
      </>
    )}
  </NavLink>
);

const SectionLabel = ({ label, collapsed }: { label: string; collapsed: boolean }) => {
  if (collapsed) {
    return <div className="mx-2 my-2 h-px bg-slate-800" />;
  }
  return (
    <div className="px-5 pt-5 pb-1">
      <span className="text-2xs font-semibold text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export const Sidebar = () => {
  const { sidebarOpen } = useUIStore();
  const { isHRAdmin, isManager } = usePermissions();
  const { user } = useAuthStore();
  const location = useLocation();

  // We use sidebarOpen as "collapsed" — when false, show icon-only mode
  const collapsed = !sidebarOpen;

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside
      className="bg-slate-900 flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden scrollbar-dark border-r border-slate-800 sidebar-transition relative"
      style={{
        width: collapsed ? "3.5rem" : "15rem",
        height: "100%",
      }}
      aria-label="Main navigation"
    >
      {/* Core nav */}
      <div className="py-3 flex flex-col gap-0.5">
        <SectionLabel label="Workspace" collapsed={collapsed} />
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>

      {/* Manager section */}
      {isManager && (
        <div className="flex flex-col gap-0.5">
          <SectionLabel label="Management" collapsed={collapsed} />
          {MANAGER_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}

      {/* Admin section */}
      {isHRAdmin && (
        <div className="flex flex-col gap-0.5">
          <SectionLabel label="Administration" collapsed={collapsed} />
          {ADMIN_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}

      {/* Bottom user area */}
      <div className="mt-auto border-t border-slate-800">
        {!collapsed ? (
          <div className="px-4 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{user?.full_name}</p>
                <p className="text-2xs text-slate-600 truncate">{user?.email}</p>
              </div>
            </div>
            <p className="text-2xs text-slate-700 mt-3">HR Platform v1.0 · On-premise</p>
          </div>
        ) : (
          <div className="flex justify-center py-3">
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold"
              title={user?.full_name}
            >
              {initials}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
