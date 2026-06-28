import { useState } from "react";
import { Citation } from "../../types/models";

export const CitationCard = ({ citation }: { citation: Citation }) => {
  const [expanded, setExpanded] = useState(false);
  const matchPct = Math.round(citation.score * 100);

  return (
    <div className="bg-blue-50 border border-blue-200/70 rounded-xl p-3.5 text-xs animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-blue-900 truncate block">{citation.document_title}</span>
            {citation.page && (
              <span className="text-blue-500 text-xs">Page {citation.page}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Match score pill */}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              matchPct >= 80
                ? "bg-emerald-100 text-emerald-700"
                : matchPct >= 60
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {matchPct}% match
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            {expanded ? "Hide" : "Expand"}
          </button>
        </div>
      </div>

      {expanded && citation.chunk_text && (
        <div className="mt-3 pt-3 border-t border-blue-200/60 animate-fade-in">
          <p className="text-slate-700 leading-relaxed text-xs">{citation.chunk_text}</p>
        </div>
      )}
    </div>
  );
};
