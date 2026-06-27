import { Grievance } from "../../types/models";
const STEPS = ["submitted", "under_review", "escalated", "resolved"];
export const EscalationTracker = ({ grievance }: { grievance: Grievance }) => {
  const idx = STEPS.indexOf(grievance.status);
  return (
    <div className="flex items-center gap-1 mt-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${i <= idx ? "bg-blue-600" : "bg-gray-200"}`} title={s} />
          {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < idx ? "bg-blue-600" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
};
