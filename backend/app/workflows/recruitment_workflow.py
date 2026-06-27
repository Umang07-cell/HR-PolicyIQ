from app.workflows.base import BaseWorkflow

class RecruitmentWorkflow(BaseWorkflow):
    PIPELINE = ["applied", "screening", "interview", "offer", "hired"]

    def run(self, state) -> dict:
        return {"pipeline": self.PIPELINE}

    def advance(self, current_status: str) -> str:
        try:
            idx = self.PIPELINE.index(current_status)
            return self.PIPELINE[idx + 1] if idx + 1 < len(self.PIPELINE) else current_status
        except ValueError:
            return current_status
