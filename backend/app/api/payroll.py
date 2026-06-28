from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.payroll import PayrollRecord
from app.schemas.payroll import PayrollOut
from pydantic import BaseModel

router = APIRouter(prefix="/payroll", tags=["Payroll"])


class PayrollCreate(BaseModel):
    employee_id: int
    month: str
    basic: float
    hra: float = 0.0
    allowances: float = 0.0
    deductions: float = 0.0
    tax_deducted: float = 0.0


@router.get("/my", response_model=List[PayrollOut], summary="My payslips")
def my_payslips(
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    limit = min(limit, 60)
    records = (
        db.query(PayrollRecord)
        .filter(PayrollRecord.employee_id == current_user.id)
        .order_by(PayrollRecord.month.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    log_action(db, current_user.id, "PAYROLL_VIEW", "payroll", None)
    return records


@router.get("/my/{month}", response_model=PayrollOut, summary="Payslip for a specific month")
def payslip_by_month(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(PayrollRecord).filter(
        PayrollRecord.employee_id == current_user.id,
        PayrollRecord.month == month,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"No payslip found for {month}")
    return record


@router.post("/", response_model=PayrollOut, summary="Create payroll record (HR Admin)")
def create_payroll(
    req: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
    net = req.basic + req.hra + req.allowances - req.deductions - req.tax_deducted
    record = PayrollRecord(
        employee_id=req.employee_id,
        month=req.month,
        basic=req.basic,
        hra=req.hra,
        allowances=req.allowances,
        deductions=req.deductions,
        tax_deducted=req.tax_deducted,
        net_salary=net,
    )
    db.add(record)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Payroll record for employee {req.employee_id} in {req.month} already exists.",
        )
    db.refresh(record)
    log_action(db, current_user.id, "PAYROLL_CREATE", "payroll", str(record.id),
               {"employee_id": req.employee_id, "month": req.month})
    return record
