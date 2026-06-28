import { client } from "./client";
export const listDocuments = (module?: string) => client.get("/documents/", { params: { module } });
export const uploadDocument = (formData: FormData) => client.post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const archiveDocument = (id: number) => client.delete(`/documents/${id}`);
export const hardDeleteDocument = (id: number) => client.delete(`/documents/${id}/hard`);
