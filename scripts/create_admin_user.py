"""Create a new HR admin user from CLI."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.models.user import User, UserRole
from app.core.security import hash_password

email = input("Admin email: ")
name = input("Full name: ")
password = input("Password: ")

Base.metadata.create_all(bind=engine)
db = SessionLocal()
if db.query(User).filter(User.email == email).first():
    print("User already exists"); db.close(); sys.exit(1)

user = User(email=email, full_name=name, hashed_password=hash_password(password), role=UserRole.hr_admin, is_active=True)
db.add(user); db.commit()
print(f"✅ Admin created: {email}")
db.close()
