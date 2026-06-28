"""
Create a new HR admin user from CLI.
Run: python scripts/create_admin_user.py
"""
import sys
import os
import getpass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash  # FIX: was hash_password

Base.metadata.create_all(bind=engine)

email = input("Admin email: ").strip().lower()
name = input("Full name: ").strip()
password = getpass.getpass("Password (min 8 chars): ")

if len(password) < 8:
    print("ERROR: Password must be at least 8 characters.")
    sys.exit(1)

if not email or "@" not in email:
    print("ERROR: Invalid email address.")
    sys.exit(1)

db = SessionLocal()
try:
    if db.query(User).filter(User.email == email).first():
        print(f"ERROR: User already exists: {email}")
        sys.exit(1)

    user = User(
        email=email,
        full_name=name,
        hashed_password=get_password_hash(password),
        role=UserRole.hr_admin,
        is_active=True,
    )
    db.add(user)
    db.commit()
    print(f"Admin created: {email}")
finally:
    db.close()
