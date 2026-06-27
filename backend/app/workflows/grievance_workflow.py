from app.workflows.base import BaseWorkflow
from app.workflows.states import GrievanceWorkflowState

class GrievanceWorkflow(BaseWorkflow):
    def __init__(self, db):
        self.db = db

    def run(self, state: GrievanceWorkflowState) -> GrievanceWorkflowState:
        from app.services.grievance_service import auto_assign_grievance, escalate_if_needed
        from app.models.grievance import Grievance

        grievance = self.db.query(Grievance).filter(Grievance.id == state.grievance_id).first()
        if not grievance:
            return state

        # Auto-assign
        assigned = auto_assign_grievance(self.db, grievance)
        if assigned:
            state.assigned_to = assigned
            self.log_step(state, f"auto_assigned_to:{assigned}")

        # Escalate critical
        if state.priority == "critical":
            escalate_if_needed(self.db, state.grievance_id)
            state.escalated = True
            self.log_step(state, "escalated_critical")

        return state
