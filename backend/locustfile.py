"""
HR Platform Stress Test — Focus: Chat, Document Upload, Database
Run: locust -f locustfile.py --host=http://localhost:8000

HOW TO GET YOUR TOKEN:
1. Open your HR Platform in the browser
2. Open DevTools → Network tab
3. Send any chat message
4. Copy the Authorization header value (without "Bearer ")
5. Paste it below as TOKEN
"""

from locust import HttpUser, task, between
import random
import os

# ─── PASTE YOUR REAL TOKEN HERE ──────────────────────────────────────────────
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwicm9sZSI6ImhyX2FkbWluIiwiZGVwYXJ0bWVudCI6IkhSIiwibG9jYXRpb24iOiJCYW5nYWxvcmUiLCJleHAiOjE3ODI4MzYyNDgsImlhdCI6MTc4MjgwNzQ0OH0.GKbtCzXuy96p37zwwyBKt5Z3xjlyUvdaPNniMlM_eqY"
# ─────────────────────────────────────────────────────────────────────────────

# Real HR questions to simulate actual usage
CHAT_QUERIES = [
    "What is the casual leave policy?",
    "How is HRA calculated in my salary?",
    "What is the notice period for resignation?",
    "Explain the work from home policy",
    "How do I apply for earned leave?",
    "What are the office timings?",
    "What documents are required for reimbursement?",
    "How is the performance appraisal conducted?",
    "What is the probation period for new employees?",
    "Can I carry forward unused leaves to next year?",
    "What is the maternity leave policy?",
    "How do I raise a grievance?",
    "What is the travel allowance policy?",
    "Explain the medical insurance benefits",
    "What is the code of conduct policy?",
]

# Only modules that still exist in your backend
MODULES = ["policy", ""]


class ChatStressTest(HttpUser):
    """
    Simulates employees hammering the AI chat endpoint.
    This is your most expensive operation — tests Qdrant + Groq + embeddings.
    """
    wait_time = between(1, 2)
    weight = 3  # 3x more chat users than other types

    def on_start(self):
        self.headers = {"Authorization": f"Bearer {TOKEN}"}

    @task(5)
    def ask_random_question(self):
        """Fire a random HR question at the AI"""
        query = random.choice(CHAT_QUERIES)
        module = random.choice(MODULES)
        with self.client.post(
            "/chat/",
            json={"query": query, "module": module if module else None},
            headers=self.headers,
            catch_response=True,
            name="POST /chat/ [AI Query]",
        ) as response:
            if response.status_code == 200:
                data = response.json()
                # Verify the response actually has an answer
                if data.get("answer"):
                    response.success()
                else:
                    response.failure("Empty answer returned")
            elif response.status_code == 401:
                response.failure("Token expired — update TOKEN in locustfile.py")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def ask_complex_question(self):
        """Ask a longer more complex query to stress the RAG pipeline more"""
        with self.client.post(
            "/chat/",
            json={
                "query": "Can you compare the different types of leaves available to me including casual, sick, earned and maternity leave, and explain the rules for each?",
                "module": "leave",
            },
            headers=self.headers,
            catch_response=True,
            name="POST /chat/ [Complex Query]",
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired — update TOKEN in locustfile.py")
            else:
                response.failure(f"HTTP {response.status_code}")


class DocumentStressTest(HttpUser):
    """
    Simulates HR admins loading and browsing the document library.
    Tests PostgreSQL + Qdrant document metadata.
    """
    wait_time = between(1, 3)
    weight = 2

    def on_start(self):
        self.headers = {"Authorization": f"Bearer {TOKEN}"}
        self.doc_ids = []

    @task(4)
    def list_documents(self):
        """Load all documents — tests DB query performance"""
        with self.client.get(
            "/documents/",
            headers=self.headers,
            catch_response=True,
            name="GET /documents/ [List All]",
        ) as response:
            if response.status_code == 200:
                docs = response.json()
                # Cache doc IDs for other tasks
                self.doc_ids = [d["id"] for d in docs if isinstance(docs, list)]
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def list_documents_filtered(self):
        """Filter documents by module — tests indexed DB query"""
        with self.client.get(
            "/documents/?module=policy",
            headers=self.headers,
            catch_response=True,
            name="GET /documents/ [Filtered by Module]",
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(1)
    def get_single_document(self):
        """Fetch a single document — tests individual DB lookup"""
        if not self.doc_ids:
            return
        doc_id = random.choice(self.doc_ids)
        with self.client.get(
            f"/documents/{doc_id}",
            headers=self.headers,
            catch_response=True,
            name="GET /documents/{id} [Single Doc]",
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")


class DatabaseStressTest(HttpUser):
    """
    Simulates admin dashboard loads.
    Tests PostgreSQL analytics queries and audit logs.
    """
    wait_time = between(2, 4)
    weight = 1

    def on_start(self):
        self.headers = {"Authorization": f"Bearer {TOKEN}"}

    @task(3)
    def load_analytics_overview(self):
        """Hit the analytics overview — tests aggregate DB queries"""
        with self.client.get(
            "/analytics/overview",
            headers=self.headers,
            catch_response=True,
            name="GET /analytics/overview [DB Aggregates]",
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def load_chat_usage(self):
        """Hit chat usage stats — tests AuditLog table queries"""
        with self.client.get(
            "/analytics/chat-usage",
            headers=self.headers,
            catch_response=True,
            name="GET /analytics/chat-usage [AuditLog Query]",
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(1)
    def load_feedback(self):
        """Hit feedback data — tests filtered AuditLog queries"""
        with self.client.get(
            "/analytics/chat-feedback",
            headers=self.headers,
            catch_response=True,
            name="GET /analytics/chat-feedback [Feedback Query]",
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(1)
    def load_audit_logs(self):
        """Load audit logs — tests large table pagination"""
        with self.client.get(
            "/admin/audit-logs?limit=50",
            headers=self.headers,
            catch_response=True,
            name="GET /admin/audit-logs [Large Table]",
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 401:
                response.failure("Token expired")
            else:
                response.failure(f"HTTP {response.status_code}")