import { useState } from "react";
import { Citation } from "../../types/models";

export const CitationCard = ({ citation }: { citation: Citation }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-semibold text-blue-800 truncate">{citation.document_title}</span>
          {citation.page && <span className="text-blue-400 flex-shrink-0">p.{citation.page}</span>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-blue-400">{(citation.score * 100).toFixed(0)}% match</span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {expanded ? "Less" : "More"}
          </button>
        </div>
      </div>
      {expanded && (
        <p className="text-slate-600 mt-2 leading-relaxed border-t border-blue-200 pt-2">{citation.chunk_text}</p>
      )}
    </div>
  );
};
