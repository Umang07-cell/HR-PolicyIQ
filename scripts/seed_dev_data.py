"""
Seed script — creates dev users for all 4 roles.
Run: python scripts/seed_dev_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.core.security import get_password_hash
from app.models import *


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = [
            {"email": "employee@hr.com", "full_name": "Priya Sharma", "role": "employee", "department": "Engineering", "location": "Pune", "password": "employee123"},
            {"email": "manager@hr.com", "full_name": "Rahul Mehta", "role": "manager", "department": "Engineering", "location": "Pune", "password": "manager123"},
            {"email": "hradmin@hr.com", "full_name": "Neha Gupta", "role": "hr_admin", "department": "Human Resources", "location": "Bangalore", "password": "admin123"},
            {"email": "exec@hr.com", "full_name": "Arun Patel", "role": "executive", "department": "Executive", "location": "Mumbai", "password": "exec123"},
        ]
        for u in users:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if not exists:
                db.add(User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    department=u["department"],
                    location=u["location"],
                    is_active=True,
                ))
                print(f"  Created {u['role']}: {u['email']}")
            else:
                print(f"  Skipped (exists): {u['email']}")
        db.commit()
        print("\n✅ Seed complete")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
