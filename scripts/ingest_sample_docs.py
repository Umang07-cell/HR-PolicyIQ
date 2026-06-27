"""Ingest sample HR documents for demo."""
import sys, os, requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

BASE_URL = "http://localhost:8000"

# Login as admin
resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "hradmin@hr.com", "password": "admin123"})
token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create a sample text doc
sample = """
Leave Policy - FY 2025-26
Employees are entitled to 12 casual leaves, 10 sick leaves, and 15 earned leaves per year.
Casual leave cannot be carried forward. Earned leaves can be encashed up to 30 days.
Leave must be applied at least 2 days in advance except for sick leave.
"""

# Write to temp file
with open("/tmp/sample_leave_policy.txt", "w") as f:
    f.write(sample)

with open("/tmp/sample_leave_policy.txt", "rb") as f:
    resp = requests.post(f"{BASE_URL}/documents/upload",
        headers=headers,
        files={"file": ("leave_policy.txt", f, "text/plain")},
        data={"title": "Leave Policy FY 2025-26", "module": "leave", "access_roles": "employee,manager,hr_admin"}
    )

print("Ingested:", resp.json())
