-- Row Level Security: employees can only see their own leave/payroll
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- hr_admin role bypasses RLS
CREATE POLICY leave_self_access ON leave_requests
    USING (employee_id = current_setting('app.user_id')::integer
           OR current_setting('app.user_role') IN ('hr_admin', 'manager', 'executive'));

CREATE POLICY payroll_self_access ON payroll_records
    USING (employee_id = current_setting('app.user_id')::integer
           OR current_setting('app.user_role') IN ('hr_admin', 'executive'));
