from app.workflows.base import BaseWorkflow
from app.workflows.states import OnboardingWorkflowState

ONBOARDING_STEPS = [
    "profile_complete",
    "id_documents_uploaded",
    "policies_attested",
    "it_setup_done",
    "bank_details_submitted",
    "induction_completed",
]

class OnboardingWorkflow(BaseWorkflow):
    def __init__(self, db):
        self.db = db

    def run(self, state: OnboardingWorkflowState) -> OnboardingWorkflowState:
        state.pending_steps = [s for s in ONBOARDING_STEPS if s not in state.completed_steps]
        state.is_complete = len(state.pending_steps) == 0
        return state

    def complete_step(self, state: OnboardingWorkflowState, step: str) -> OnboardingWorkflowState:
        if step in ONBOARDING_STEPS and step not in state.completed_steps:
            state.completed_steps.append(step)
            self.log_step(state, f"completed:{step}")
        return self.run(state)
