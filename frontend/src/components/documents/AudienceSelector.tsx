const ROLES = ["employee", "manager", "hr_admin", "executive"];
export const AudienceSelector = ({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) => (
  <div className="flex gap-2 flex-wrap">
    {ROLES.map((r) => (
      <label key={r} className="flex items-center gap-1 text-sm cursor-pointer">
        <input type="checkbox" checked={selected.includes(r)} onChange={(e) => onChange(e.target.checked ? [...selected, r] : selected.filter((x) => x !== r))} />
        {r}
      </label>
    ))}
  </div>
);
