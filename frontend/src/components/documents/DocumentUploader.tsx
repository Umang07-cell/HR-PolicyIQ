import { useState, useRef } from "react";
import { uploadDocument } from "../../api/documents";
import { useNotificationStore } from "../../store/notificationStore";
import { HR_MODULES } from "../../utils/constants";
import { Button } from "../ui/Button";

const MAX_SIZE_MB = 50;

export const DocumentUploader = ({ onSuccess }: { onSuccess: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({ title: "", module: "policy", access_roles: "employee,manager,hr_admin", access_departments: "", access_locations: "" });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { add: notify } = useNotificationStore();

  const handleFile = (f: File) => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) { notify(`File too large. Max ${MAX_SIZE_MB}MB allowed.`, "error"); return; }
    setFile(f);
    if (!meta.title) setMeta((m) => ({ ...m, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const upload = async () => {
    if (!file || !meta.title.trim()) { notify("File and title are required", "error"); return; }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", meta.title.trim());
    fd.append("module", meta.module);
    fd.append("access_roles", meta.access_roles);
    fd.append("access_departments", meta.access_departments);
    fd.append("access_locations", meta.access_locations);
    setLoading(true);
    try {
      await uploadDocument(fd);
      notify("Document uploaded and indexed successfully", "success");
      onSuccess();
    } catch (err: any) {
      notify(err?.response?.data?.detail || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? "border-blue-400 bg-blue-50" : file ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.csv,.html" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {file ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
            <p className="text-xs text-emerald-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-600">Drop a file or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, CSV, HTML · Max {MAX_SIZE_MB}MB</p>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Document title *</label>
        <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="e.g. Leave Policy 2025" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Module</label>
          <select value={meta.module} onChange={(e) => setMeta({ ...meta, module: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {HR_MODULES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Access roles</label>
          <input value={meta.access_roles} onChange={(e) => setMeta({ ...meta, access_roles: e.target.value })} placeholder="employee,manager,hr_admin" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Departments <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={meta.access_departments} onChange={(e) => setMeta({ ...meta, access_departments: e.target.value })} placeholder="engineering,hr" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Locations <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={meta.access_locations} onChange={(e) => setMeta({ ...meta, access_locations: e.target.value })} placeholder="pune,bangalore" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <Button onClick={upload} loading={loading} disabled={!file} className="w-full">
        {loading ? "Uploading & indexing..." : "Upload & Index"}
      </Button>
    </div>
  );
};
