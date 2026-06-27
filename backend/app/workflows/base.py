from abc import ABC, abstractmethod
from typing import Any

class BaseWorkflow(ABC):
    """Base class for all HR workflows."""

    @abstractmethod
    def run(self, state: Any) -> Any:
        pass

    def log_step(self, state: Any, step: str):
        if hasattr(state, "history"):
            state.history.append(f"{step}")
        return state
