import { client } from "./client";
export const submitLeave = (data: any) => client.post("/leave/request", data);
export const getMyLeaves = () => client.get("/leave/my");
export const getPendingLeaves = () => client.get("/leave/pending");
export const actionLeave = (id: number, action: string, comment?: string) => client.post(`/leave/${id}/action`, { action, comment });
