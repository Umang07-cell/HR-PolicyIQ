from app.workflows.base import BaseWorkflow

class PerformanceWorkflow(BaseWorkflow):
    def run(self, state) -> dict:
        return {"status": "draft", "next_action": "manager_review"}
