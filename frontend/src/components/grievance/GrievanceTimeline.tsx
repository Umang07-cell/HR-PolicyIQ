interface TimelineEvent {
  label: string;
  date?: string;
  active?: boolean;
}

export const GrievanceTimeline = ({ events }: { events: TimelineEvent[] }) => (
  <div className="space-y-3">
    {events.map((e, i) => (
      <div key={i} className="flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${e.active ? "bg-blue-500" : "bg-slate-200"}`} />
        <div>
          <p className={`text-sm font-medium ${e.active ? "text-slate-900" : "text-slate-400"}`}>{e.label}</p>
          {e.date && <p className="text-xs text-slate-400 mt-0.5">{e.date}</p>}
        </div>
      </div>
    ))}
  </div>
);
