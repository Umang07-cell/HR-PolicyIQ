import { DashboardStats } from "../../types/models";
import { StatCard } from "../ui/StatCard";

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export const MetricsPanel = ({ stats }: { stats: DashboardStats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard
        label="Total Users"
        value={stats.total_users}
        color="blue"
        icon={<Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
      />
      <StatCard
        label="Documents"
        value={stats.total_documents}
        color="purple"
        icon={<Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
      />
      <StatCard
        label="Indexed"
        value={stats.indexed_documents}
        color="green"
        description="Documents available for AI search"
        icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
      />
      <StatCard
        label="Chat Queries"
        value={stats.total_queries}
        color="blue"
        icon={<Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
      />
      <StatCard
        label="Pending Leaves"
        value={stats.pending_leaves}
        color={stats.pending_leaves > 0 ? "amber" : "green"}
        icon={<Icon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
      />
      <StatCard
        label="Open Grievances"
        value={stats.open_grievances}
        color={stats.open_grievances > 0 ? "red" : "green"}
        icon={<Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
      />
    </div>
  </div>
);
