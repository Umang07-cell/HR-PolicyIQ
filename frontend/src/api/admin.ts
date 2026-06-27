import { client } from "./client";
export const getDashboard = () => client.get("/admin/dashboard");
export const getUsers = () => client.get("/admin/users");
export const getAuditLogs = (limit = 100) => client.get("/admin/audit-logs", { params: { limit } });
export const getAnalytics = () => client.get("/analytics/overview");
export const getLeaveTrends = () => client.get("/analytics/leave-trends");
export const getChatUsage = () => client.get("/analytics/chat-usage");
