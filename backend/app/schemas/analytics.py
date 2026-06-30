from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_users: int
    total_documents: int
    total_queries: int
    indexed_documents: int
