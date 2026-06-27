import { Document } from "../../types/models";
export const VersionHistory = ({ versions }: { versions: Document[] }) => (
  <div className="space-y-2">
    {versions.map((v) => (
      <div key={v.id} className="flex justify-between text-sm border-b pb-2">
        <span>v{v.version} — {v.filename}</span>
        <span className="text-gray-400">{v.status}</span>
      </div>
    ))}
  </div>
);
