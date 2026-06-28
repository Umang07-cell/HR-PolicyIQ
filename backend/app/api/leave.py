from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveStatus
from app.schemas.leave import LeaveRequestCreate, LeaveApprovalAction, LeaveOut
from typing import List

router = APIRouter(prefix="/leave", tags=["Leave & Attendance"])


@router.post("/request", response_model=LeaveOut, summary="Submit a leave request")
def submit_leave(
    req: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.end_date < req.start_date:
        raise HTTPException(status_code=400, detail="End date must be on or after start date")
    days = (req.end_date - req.start_date).days + 1
    leave = LeaveRequest(
        employee_id=current_user.id,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        days=days,
        reason=req.reason,
        status=LeaveStatus.pending,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    log_action(db, current_user.id, "LEAVE_REQUEST", "leave", str(leave.id), {"type": req.leave_type, "days": days})
    return leave


@router.get("/my", response_model=List[LeaveOut], summary="My leave requests")
def my_leaves(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    limit = min(limit, 100)
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_user.id)
        .order_by(LeaveRequest.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/pending", response_model=List[LeaveOut], summary="Pending leave requests (managers)")
def pending_leaves(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager", "hr_admin", "executive")),
):
    limit = min(limit, 100)
    q = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.pending)

    if current_user.role == "manager" and current_user.department:
        q = q.join(User, User.id == LeaveRequest.employee_id).filter(
            User.department == current_user.department
        )

    return q.order_by(LeaveRequest.id.desc()).offset(skip).limit(limit).all()


@router.post("/{leave_id}/action", response_model=LeaveOut, summary="Approve or reject a leave request")
def action_leave(
    leave_id: int,
    req: LeaveApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("manager", "hr_admin", "executive")),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Leave request is not pending")

    if current_user.role == "manager" and current_user.department:
        employee = db.query(User).filter(User.id == leave.employee_id).first()
        if employee and employee.department != current_user.department:
            raise HTTPException(status_code=403, detail="You can only action leaves for your department")

    if req.action == "approve":
        leave.status = LeaveStatus.approved
        action_label = "LEAVE_APPROVE"
    elif req.action == "reject":
        leave.status = LeaveStatus.rejected
        action_label = "LEAVE_REJECT"
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    leave.approver_id = current_user.id
    leave.approver_comment = req.comment
    db.commit()
    db.refresh(leave)
    log_action(db, current_user.id, action_label, "leave", str(leave_id), {"comment": req.comment})
    return leave
