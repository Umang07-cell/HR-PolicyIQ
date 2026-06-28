"""
Ingest sample HR documents for demo/dev.
Run: python scripts/ingest_sample_docs.py

Prerequisites:
  - Backend running at http://localhost:8000
  - Users seeded (python scripts/seed_db.py)
"""
import sys
import os
import tempfile
import requests

BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")

SAMPLE_DOCS = [
    {
        "title": "Leave Policy FY 2025-26",
        "module": "leave",
        "access_roles": "employee,manager,hr_admin",
        "content": """Leave Policy - FY 2025-26

Casual Leave (CL):
Employees are entitled to 12 casual leaves per calendar year.
CL cannot be accumulated, encashed, or carried forward to the next calendar year.
You are required to apply for CL on mail to your manager at least a week in advance for approval.
Leave taken without manager approval will be considered as Unapproved leave and leads to salary deduction.

Sick Leave (SL):
Employees are entitled to 10 sick leaves per calendar year.
Medical certificate is required for sick leave exceeding 3 consecutive days.

Earned Leave (EL):
Employees are entitled to 15 earned leaves per calendar year.
Earned leaves can be carried forward up to a maximum of 30 days.
EL can be encashed up to 30 days on separation from the company.

Maternity Leave:
Female employees are entitled to 26 weeks of paid maternity leave.
Adoption leave: 12 weeks for the primary caregiver.
""",
        "content_type": "text/plain",
    },
    {
        "title": "Salary & Compensation Policy",
        "module": "payroll",
        "access_roles": "employee,manager,hr_admin",
        "content": """Salary & Compensation Policy

Salary Components:
Your salary will include the following components as part of CTC:
- Basic Salary
- Home Rent Allowance (HRA)
- Leave Traveling Allowance (LTA)
- Medical Reimbursement
- Conveyance Allowance
- Project Development Allowance (PDA)
- Food Coupons
- Employer Contribution to PF and ESIC
- Performance Bonus

Payment Schedule:
Your salary will be paid on a monthly basis based on your attendance by the 31st of every month.
In case the last day of the month falls on a Saturday, Sunday or Non Working day, your salary will be disbursed on the preceding working day.

HRA:
HRA is calculated as 40% of basic salary for employees in non-metro cities and 50% for metro cities.
""",
        "content_type": "text/plain",
    },
    {
        "title": "Code of Conduct",
        "module": "policy",
        "access_roles": "employee,manager,hr_admin,executive",
        "content": """Code of Conduct

All employees are expected to maintain the highest standards of professional conduct.

Professional Behaviour:
Employees must treat all colleagues, clients, and stakeholders with respect and dignity.
Discrimination, harassment, or bullying of any kind will not be tolerated.
Any violation must be reported to HR immediately.

Confidentiality:
Employees must not disclose confidential company information to unauthorised parties.
This obligation continues after separation from the company.

Conflict of Interest:
Employees must disclose any potential conflicts of interest to their manager and HR.

Notice Period:
The notice period for resignation is 30 days for employees and 60 to 90 days for managers and above.
""",
        "content_type": "text/plain",
    },
]


def login(email: str, password: str) -> str:
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} — {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def upload_doc(token: str, doc: dict) -> dict:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write(doc["content"])
        tmp_path = f.name
    try:
        with open(tmp_path, "rb") as f:
            resp = requests.post(
                f"{BASE_URL}/documents/upload",
                headers={"Authorization": f"Bearer {token}"},
                files={"file": (f"{doc['title'].replace(' ', '_')}.txt", f, doc["content_type"])},
                data={
                    "title": doc["title"],
                    "module": doc["module"],
                    "access_roles": doc["access_roles"],
                },
            )
        if resp.status_code not in (200, 202):
            print(f"  Upload failed ({resp.status_code}): {resp.text}")
            return {}
        return resp.json()
    finally:
        os.unlink(tmp_path)


def main():
    print("HR PolicyIQ — Sample Document Ingestion")
    print(f"Target: {BASE_URL}")
    print()

    token = login("hradmin@hr.com", "admin123")
    print("Logged in as hradmin@hr.com")
    print()

    for doc in SAMPLE_DOCS:
        print(f"Uploading: {doc['title']}...")
        result = upload_doc(token, doc)
        if result:
            print(f"  OK — id={result.get('id')} status={result.get('status')}")
        else:
            print(f"  FAILED")

    print()
    print("Done. Ask the chatbot:")
    print('  "How many casual leaves am I entitled to?"')
    print('  "When is my salary paid?"')
    print('  "What is the notice period for resignation?"')


if __name__ == "__main__":
    main()
