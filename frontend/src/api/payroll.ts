import { client } from "./client";
export const getMyPayslips = () => client.get("/payroll/my");
export const getPayslipByMonth = (month: string) => client.get(`/payroll/my/${month}`);
