from pydantic import BaseModel
from typing import Optional

class PayrollOut(BaseModel):
    id: int
    employee_id: int
    month: str
    basic: float
    hra: float
    allowances: float
    deductions: float
    net_salary: float
    tax_deducted: float
    model_config = {"from_attributes": True}
