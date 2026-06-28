import { useState, useRef } from "react";
import { uploadDocument } from "../../api/documents";
import { useNotificationStore } from "../../store/notificationStore";
import { HR_MODULES } from "../../utils/constants";
import { Button } from "../ui/Button";

const MAX_SIZE_MB = 50;

const inputClass = "w-full border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

export const DocumentUploader = ({ onSuccess }: { onSuccess: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({
    title: "",
    module: "policy",
    access_roles: "employee,manager,hr_admin",
    access_departments: "",
    access_locations: "",
  });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { add: notify } = useNotificationStore();

  const handleFile = (f: File) => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      notify(`File too large. Max ${MAX_SIZE_MB} MB allowed.`, "error");
      return;
    }
    setFile(f);
    if (!meta.title) setMeta((m) => ({ ...m, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const upload = async () => {
    if (!file || !meta.title.trim()) {
      notify("File and title are required.", "error");
      return;
    }
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
      notify(err?.response?.data?.detail || "Upload failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50/80 scale-[1.01]"
            : file
            ? "border-emerald-300 bg-emerald-50/60"
            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.csv,.html"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {file ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-emerald-700 truncate max-w-xs mx-auto">{file.name}</p>
            <p className="text-xs text-emerald-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">Drop a file or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, CSV, HTML · Max {MAX_SIZE_MB} MB</p>
          </>
        )}
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Document title <span className="text-red-400 normal-case font-normal">*</span></label>
        <input
          value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
          placeholder="e.g. Leave Policy 2025"
          className={inputClass}
        />
      </div>

      {/* Module + access roles */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Module</label>
          <div className="relative">
            <select
              value={meta.module}
              onChange={(e) => setMeta({ ...meta, module: e.target.value })}
              className={`${inputClass} appearance-none pr-8 cursor-pointer`}
            >
              {HR_MODULES.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div>
          <label className={labelClass}>Access roles</label>
          <input
            value={meta.access_roles}
            onChange={(e) => setMeta({ ...meta, access_roles: e.target.value })}
            placeholder="employee,manager,hr_admin"
            className={inputClass}
          />
        </div>
      </div>

      {/* Optional filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Departments <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
          <input
            value={meta.access_departments}
            onChange={(e) => setMeta({ ...meta, access_departments: e.target.value })}
            placeholder="engineering,hr"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Locations <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
          <input
            value={meta.access_locations}
            onChange={(e) => setMeta({ ...meta, access_locations: e.target.value })}
            placeholder="pune,bangalore"
            className={inputClass}
          />
        </div>
      </div>

      {/* Upload button */}
      <Button
        onClick={upload}
        loading={loading}
        disabled={!file || !meta.title.trim()}
        className="w-full justify-center"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        }
      >
        {loading ? "Uploading & indexing…" : "Upload & Index Document"}
      </Button>
    </div>
  );
};
