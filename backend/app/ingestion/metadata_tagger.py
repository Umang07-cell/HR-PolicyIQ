"""Auto-tag documents with module and access metadata based on content keywords."""
from typing import Dict, List

MODULE_KEYWORDS = {
    "leave": ["leave", "vacation", "absence", "holiday", "sick", "casual"],
    "payroll": ["salary", "payroll", "compensation", "ctc", "increment", "bonus", "tax"],
    "grievance": ["grievance", "complaint", "harassment", "misconduct", "disciplinary"],
    "recruitment": ["recruitment", "hiring", "onboarding", "interview", "job posting"],
    "performance": ["performance", "appraisal", "kpi", "rating", "review", "goal"],
    "policy": ["policy", "code of conduct", "compliance", "regulation", "guideline"],
}

def detect_module(text: str) -> str:
    lower = text.lower()
    scores = {module: 0 for module in MODULE_KEYWORDS}
    for module, keywords in MODULE_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                scores[module] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "policy"

def suggest_access_roles(module: str) -> List[str]:
    sensitive = {"payroll", "performance"}
    if module in sensitive:
        return ["manager", "hr_admin"]
    return ["employee", "manager", "hr_admin"]
