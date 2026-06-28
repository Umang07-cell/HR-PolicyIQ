import { useState, useEffect, useCallback } from "react";
import { listDocuments, archiveDocument } from "../../api/documents";
import { DocumentUploader } from "../documents/DocumentUploader";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { TableSkeleton } from "../ui/Skeleton";
import { useNotificationStore } from "../../store/notificationStore";
import { Document } from "../../types/models";

export const PolicyManager = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listDocuments();
      setDocs(r.data);
    } catch {
      notify("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const handleArchive = async (id: number, title: string) => {
    if (!confirm(`Archive "${title}"? It will no longer appear in search results.`)) return;
    try {
      await archiveDocument(id);
      notify("Document archived", "success");
      load();
    } catch {
      notify("Failed to archive document", "error");
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {docs.length} document{docs.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={() => setShowUpload(true)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
        >
          Upload Document
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-border">
          <EmptyState
            title="No documents uploaded"
            description="Upload HR policy documents to make them searchable by the AI Assistant."
            action={{ label: "Upload Document", onClick: () => setShowUpload(true) }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-border overflow-hidden shadow-card divide-y divide-slate-50">
          {docs.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-secondary transition-colors group"
            >
              {/* Doc icon */}
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-400 capitalize">{d.module}</span>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-xs text-slate-400">v{d.version}</span>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-xs text-slate-400">{d.chunk_count} chunks</span>
                  {d.is_indexed ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Indexed
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Pending</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge label={d.status} />
                {d.status !== "archived" && (
                  <button
                    onClick={() => handleArchive(d.id, d.title)}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Archive document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <Modal title="Upload HR Document" description="Supported formats: PDF, DOCX" onClose={() => setShowUpload(false)}>
          <DocumentUploader onSuccess={() => { setShowUpload(false); load(); }} />
        </Modal>
      )}
    </div>
  );
};
