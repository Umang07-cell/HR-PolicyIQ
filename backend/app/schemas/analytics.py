from pydantic import BaseModel
from typing import Dict, Any

class DashboardStats(BaseModel):
    total_users: int
    total_documents: int
    total_queries: int
    pending_leaves: int
    open_grievances: int
    indexed_documents: int
