"""
Test configuration for HR PolicyIQ.

Database: SQLite (in-memory for speed). Known limitations vs PostgreSQL:
  - TIMESTAMPTZ columns lose timezone info
  - Enum types behave differently (stored as strings)
  - JSON columns work on SQLite 3.39+ / Python 3.11+
  - RLS policies are not applied (PostgreSQL-only feature)
  For production-fidelity tests, use testcontainers-python with PostgreSQL.

Auth: /auth/login is implemented. Fixtures obtain real JWT tokens.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.db.session import get_db

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

TEST_DB_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})

# Enable FK constraints on SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture
def db():
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    from main import app
    def override_db():
        yield db
    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _create_user_and_token(client, db, email, password, role, full_name="Test User"):
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    existing = db.query(User).filter(User.email == email).first()
    if not existing:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


@pytest.fixture
def admin_token(client, db):
    return _create_user_and_token(
        client, db,
        email="test_admin@hr.com",
        password="admin123secure",
        role="hr_admin",
        full_name="Test Admin",
    )


@pytest.fixture
def employee_token(client, db):
    return _create_user_and_token(
        client, db,
        email="test_emp@hr.com",
        password="emp123secure",
        role="employee",
        full_name="Test Employee",
    )


@pytest.fixture
def manager_token(client, db):
    return _create_user_and_token(
        client, db,
        email="test_mgr@hr.com",
        password="mgr123secure",
        role="manager",
        full_name="Test Manager",
    )
