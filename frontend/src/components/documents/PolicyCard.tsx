import { Document } from "../../types/models";
import { Badge } from "../common/Badge";

export const PolicyCard = ({ doc }: { doc: Document }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 truncate">{doc.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{doc.filename} · v{doc.version} · {doc.chunk_count} chunks</p>
      </div>
      <Badge label={doc.status} />
    </div>
    <div className="flex gap-1.5 mt-2 flex-wrap items-center">
      {doc.access_roles?.map((r) => (
        <span key={r} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{r}</span>
      ))}
      <span className={`ml-auto text-xs font-medium ${doc.is_indexed ? "text-emerald-600" : "text-amber-500"}`}>
        {doc.is_indexed ? "✓ Indexed" : "⏳ Pending"}
      </span>
    </div>
  </div>
);
