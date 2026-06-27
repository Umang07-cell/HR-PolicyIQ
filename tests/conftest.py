import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.db.session import get_db
from main import app

TEST_DB_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    session = TestingSession()
    try: yield session
    finally: session.close()

@pytest.fixture
def client(db):
    def override_db(): yield db
    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c: yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token(client):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    db = TestingSession()
    if not db.query(User).filter(User.email == "test_admin@hr.com").first():
        db.add(User(email="test_admin@hr.com", full_name="Test Admin", hashed_password=hash_password("admin123"), role=UserRole.hr_admin))
        db.commit()
    db.close()
    res = client.post("/auth/login", json={"email": "test_admin@hr.com", "password": "admin123"})
    return res.json()["access_token"]

@pytest.fixture
def employee_token(client):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    db = TestingSession()
    if not db.query(User).filter(User.email == "test_emp@hr.com").first():
        db.add(User(email="test_emp@hr.com", full_name="Test Employee", hashed_password=hash_password("emp123"), role=UserRole.employee))
        db.commit()
    db.close()
    res = client.post("/auth/login", json={"email": "test_emp@hr.com", "password": "emp123"})
    return res.json()["access_token"]
