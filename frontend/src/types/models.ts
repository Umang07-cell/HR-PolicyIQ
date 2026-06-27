export type UserRole = "employee" | "manager" | "hr_admin" | "executive";

export interface User { id: number; email: string; full_name: string; role: UserRole; department?: string; location?: string; employee_id?: string; is_active: boolean; }
export interface Document { id: number; title: string; filename: string; module: string; version: number; status: string; chunk_count: number; is_indexed: boolean; access_roles: string[]; uploaded_by: number; }
export interface LeaveRequest { id: number; employee_id: number; leave_type: string; start_date: string; end_date: string; days: number; status: string; reason?: string; approver_comment?: string; }
export interface Grievance { id: number; title: string; category?: string; status: string; priority: string; employee_id: number; }
export interface PerformanceReview { id: number; employee_id: number; reviewer_id: number; review_period: string; rating?: number; status: string; }
export interface PayrollRecord { id: number; employee_id: number; month: string; basic: number; hra: number; allowances: number; deductions: number; net_salary: number; tax_deducted: number; }
export interface Citation { document_id?: number; document_title: string; chunk_text: string; score: number; page?: number; chunk_index?: number; }
export interface ChatMessage { role: "user" | "assistant"; content: string; citations?: Citation[]; confidence?: number; confidence_label?: string; streaming?: boolean; }
export interface DashboardStats { total_users: number; total_documents: number; total_queries: number; pending_leaves: number; open_grievances: number; indexed_documents: number; }