import { client } from "./client";
export const getNotifications = () => client.get("/admin/audit-logs?limit=20");
