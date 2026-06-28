"""
Seed script — creates test users and sample payroll records.
Idempotent: safe to run multiple times.

Run: python scripts/seed_db.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.models.user import User, UserRole
from app.models.payroll import PayrollRecord
from app.core.security import get_password_hash  # FIX: was hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

users = [
    {"email": "employee@hr.com", "full_name": "Raj Sharma", "password": "employee123",
     "role": "employee", "department": "engineering", "location": "mumbai", "employee_id": "EMP001"},
    {"email": "manager@hr.com", "full_name": "Priya Mehta", "password": "manager123",
     "role": "manager", "department": "engineering", "location": "mumbai", "employee_id": "MGR001"},
    {"email": "hradmin@hr.com", "full_name": "Anita Desai", "password": "admin123",
     "role": "hr_admin", "department": "hr", "location": "pune", "employee_id": "HR001"},
    {"email": "exec@hr.com", "full_name": "Vikram Nair", "password": "exec123",
     "role": "executive", "department": "executive", "location": "mumbai", "employee_id": "EXEC001"},
]

created_ids = []
for u in users:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if not existing:
        user = User(
            email=u["email"],
            full_name=u["full_name"],
            hashed_password=get_password_hash(u["password"]),
            role=u["role"],
            department=u["department"],
            location=u["location"],
            employee_id=u["employee_id"],
            is_active=True,
        )
        db.add(user)
        db.flush()
        created_ids.append(user.id)
        print(f"Created: {u['email']} ({u['role']})")
    else:
        print(f"Exists:  {u['email']}")
        created_ids.append(existing.id)

emp_id = created_ids[0]
for month in ["2026-04", "2026-05", "2026-06"]:
    existing = db.query(PayrollRecord).filter(
        PayrollRecord.employee_id == emp_id,
        PayrollRecord.month == month,
    ).first()
    if not existing:
        db.add(PayrollRecord(
            employee_id=emp_id, month=month,
            basic=50000.0, hra=20000.0, allowances=5000.0,
            deductions=3000.0, net_salary=72000.0, tax_deducted=8000.0,
        ))
        print(f"Created payroll: {month}")

db.commit()
db.close()

print("\nSeed complete. Login with:")
print("  employee@hr.com / employee123")
print("  manager@hr.com  / manager123")
print("  hradmin@hr.com  / admin123")
print("  exec@hr.com     / exec123")
