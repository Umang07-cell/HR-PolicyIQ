from app.workflows.base import BaseWorkflow
from app.workflows.states import LeaveWorkflowState
from app.workflows.nodes import check_leave_overlap, check_leave_balance, notify_approver

class LeaveWorkflow(BaseWorkflow):
    def __init__(self, db):
        self.db = db

    def run(self, state: LeaveWorkflowState) -> LeaveWorkflowState:
        # Step 1: Check overlap
        from app.models.leave import LeaveRequest
        leave = self.db.query(LeaveRequest).filter(LeaveRequest.id == state.leave_id).first()
        if not leave:
            return state

        state.has_overlap = check_leave_overlap(self.db, state.employee_id, leave.start_date, leave.end_date)
        self.log_step(state, f"overlap_check: {state.has_overlap}")

        if state.has_overlap:
            state.status = "rejected_overlap"
            return state

        # Step 2: Check balance
        state.balance_sufficient = check_leave_balance(self.db, state.employee_id, leave.leave_type.value, leave.days)
        self.log_step(state, f"balance_check: {state.balance_sufficient}")

        if not state.balance_sufficient:
            state.status = "rejected_insufficient_balance"
            return state

        # Step 3: Notify approver
        if state.approver_id:
            notify_approver(self.db, state.approver_id, f"Leave request #{state.leave_id} needs your approval.")
            self.log_step(state, "approver_notified")

        state.status = "pending_approval"
        return state
