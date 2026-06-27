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
    if (!confirm(`Archive "${title}"?`)) return;
    try {
      await archiveDocument(id);
      notify("Document archived", "success");
      load();
    } catch {
      notify("Failed to archive", "error");
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{docs.length} document{docs.length !== 1 ? "s" : ""}</p>
        <Button
          size="sm"
          onClick={() => setShowUpload(true)}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        >
          Upload
        </Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          title="No documents uploaded"
          description="Upload HR policy documents to make them searchable."
          action={{ label: "Upload Document", onClick: () => setShowUpload(true) }}
        />
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">v{d.version} · {d.module} · {d.chunk_count} chunks · {d.is_indexed ? "✓ indexed" : "pending"}</p>
              </div>
              <Badge label={d.status} />
              {d.status !== "archived" && (
                <button
                  onClick={() => handleArchive(d.id, d.title)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Archive"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <Modal title="Upload Document" onClose={() => setShowUpload(false)}>
          <DocumentUploader onSuccess={() => { setShowUpload(false); load(); }} />
        </Modal>
      )}
    </div>
  );
};
