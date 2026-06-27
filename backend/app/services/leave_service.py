from sqlalchemy.orm import Session
from typing import List
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from datetime import date

LEAVE_BALANCE = {
    LeaveType.casual: 12,
    LeaveType.sick: 10,
    LeaveType.earned: 15,
    LeaveType.maternity: 180,
    LeaveType.paternity: 15,
    LeaveType.unpaid: 999,
}

def get_leave_balance(db: Session, employee_id: int, year: int) -> dict:
    used = {}
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status == LeaveStatus.approved,
    ).all()
    for leave in leaves:
        if leave.start_date.year == year:
            used[leave.leave_type] = used.get(leave.leave_type, 0) + leave.days
    balance = {}
    for lt, total in LEAVE_BALANCE.items():
        balance[lt.value] = {"total": total, "used": used.get(lt, 0), "remaining": total - used.get(lt, 0)}
    return balance

def check_overlap(db: Session, employee_id: int, start: date, end: date) -> bool:
    overlap = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status.in_([LeaveStatus.pending, LeaveStatus.approved]),
        LeaveRequest.start_date <= end,
        LeaveRequest.end_date >= start,
    ).first()
    return overlap is not None
