import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listDocuments, archiveDocument } from "../api/documents";
import { DocumentUploader } from "../components/documents/DocumentUploader";
import { Modal } from "../components/common/Modal";
import { Badge } from "../components/common/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { usePermissions } from "../hooks/usePermissions";
import { useNotificationStore } from "../store/notificationStore";
import { Document } from "../types/models";
import { HR_MODULES } from "../utils/constants";

const moduleColors: Record<string, string> = {
  policy: "bg-blue-50 text-blue-700",
  leave: "bg-emerald-50 text-emerald-700",
  payroll: "bg-amber-50 text-amber-700",
  recruitment: "bg-purple-50 text-purple-700",
  performance: "bg-orange-50 text-orange-700",
  grievance: "bg-red-50 text-red-700",
};

const Icon = ({ path }: { path: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

export default function PolicyLibrary() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [module, setModule] = useState("");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const { canUploadDocs } = usePermissions();
  const { add: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listDocuments(module || undefined);
      setDocs(r.data);
    } catch {
      notify("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, [module, notify]);

  useEffect(() => { load(); }, [load]);

  const handleArchive = async (id: number, title: string) => {
    if (!confirm(`Archive "${title}"? It will no longer be searchable.`)) return;
    try {
      await archiveDocument(id);
      notify("Document archived", "success");
      load();
    } catch {
      notify("Failed to archive document", "error");
    }
  };

  const filtered = docs.filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title="Policy Library"
        subtitle="Browse and search HR policies and documents"
        action={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")} 
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Switch Role
            </button>
            {canUploadDocs && (
              <Button
                onClick={() => setShowUpload(true)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
              >
                Upload Document
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
        >
          <option value="">All modules</option>
          {HR_MODULES.map((m) => <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={<Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
            title={search ? "No matching documents" : "No documents yet"}
            description={search ? `No documents match "${search}".` : "Upload HR policy documents to make them searchable."}
            action={canUploadDocs ? { label: "Upload Document", onClick: () => setShowUpload(true) } : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{d.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${moduleColors[d.module] || "bg-slate-100 text-slate-600"}`}>
                        {d.module}
                      </span>
                      <span className="text-xs text-slate-400">v{d.version}</span>
                      <span className="text-xs text-slate-400">{d.chunk_count} chunks</span>
                      {d.is_indexed ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Indexed
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pending index</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge label={d.status} />
                  {canUploadDocs && d.status !== "archived" && (
                    <button
                      onClick={() => handleArchive(d.id, d.title)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Archive document"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {d.access_roles?.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {d.access_roles.map((r) => (
                    <span key={r} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{r}</span>
                  ))}
                </div>
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
}
