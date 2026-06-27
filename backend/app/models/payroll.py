from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, JSON
from app.db.base import Base
from app.models.base import TimestampMixin

class PayrollRecord(Base, TimestampMixin):
    __tablename__ = "payroll_records"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(String(7), nullable=False)   # "2024-06"
    basic = Column(Float, nullable=False)
    hra = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float, nullable=False)
    tax_deducted = Column(Float, default=0.0)
    breakdown = Column(JSON, default=dict)

