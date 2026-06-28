from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class PayrollOut(BaseModel):
    id: int
    employee_id: int
    month: str
    basic: Decimal
    hra: Decimal
    allowances: Decimal
    deductions: Decimal
    net_salary: Decimal
    tax_deducted: Decimal
    model_config = {"from_attributes": True}
