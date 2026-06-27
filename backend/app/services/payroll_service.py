from sqlalchemy.orm import Session
from typing import Optional
from app.models.payroll import PayrollRecord

def calculate_net_salary(basic: float, hra: float, allowances: float, deductions: float) -> dict:
    gross = basic + hra + allowances
    tax = gross * 0.1 if gross > 50000 else 0
    net = gross - deductions - tax
    return {"gross": gross, "tax": tax, "net_salary": net, "tax_deducted": tax}

def get_payslip(db: Session, employee_id: int, month: str) -> Optional[PayrollRecord]:
    return db.query(PayrollRecord).filter(
        PayrollRecord.employee_id == employee_id,
        PayrollRecord.month == month
    ).first()
