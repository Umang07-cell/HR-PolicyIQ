from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, JSON, UniqueConstraint
from app.db.base import Base
from app.models.base import TimestampMixin


class PayrollRecord(Base, TimestampMixin):
    __tablename__ = "payroll_records"
    __table_args__ = (
        UniqueConstraint("employee_id", "month", name="uq_payroll_employee_month"),
    )

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String(7), nullable=False)
    basic = Column(Numeric(12, 2), nullable=False)
    hra = Column(Numeric(12, 2), default=0.0)
    allowances = Column(Numeric(12, 2), default=0.0)
    deductions = Column(Numeric(12, 2), default=0.0)
    net_salary = Column(Numeric(12, 2), nullable=False)
    tax_deducted = Column(Numeric(12, 2), default=0.0)
    breakdown = Column(JSON, default=dict)
