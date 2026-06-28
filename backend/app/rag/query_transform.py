import re

HR_SYNONYMS = {
    "leave": ["vacation", "absence", "time off", "holiday", "annual leave", "PTO", "paid leave"],
    "salary": ["compensation", "pay", "ctc", "package", "remuneration", "wages", "income"],
    "grievance": ["complaint", "issue", "concern", "dispute", "conflict", "problem"],
    "appraisal": ["performance review", "rating", "evaluation", "assessment", "feedback"],
    "resign": ["quit", "resignation", "notice period", "exit", "termination", "separation"],
    "reimbursement": ["expense", "claim", "refund", "allowance", "petty cash"],
    "probation": ["trial period", "confirmation", "probationary period"],
    "attendance": ["presence", "punctuality", "absenteeism", "working hours", "shift"],
    "promotion": ["increment", "raise", "advancement", "grade change", "career growth"],
    "maternity": ["parental leave", "paternity", "childcare", "birth", "pregnancy"],
    "travel": ["business trip", "tour", "TA", "travel allowance", "conveyance"],
    "insurance": ["medical", "health cover", "ESI", "ESIC", "group health", "hospitalization"],
    "pf": ["provident fund", "EPF", "retirement", "PF contribution", "UAN"],
    "bonus": ["incentive", "reward", "variable pay", "performance bonus", "ex gratia"],
    "onboarding": ["joining", "induction", "orientation", "new hire", "first day"],
    "policy": ["rule", "guideline", "procedure", "regulation", "norm", "code of conduct"],
    "transfer": ["relocation", "deputation", "posting", "site change"],
    "holiday": ["public holiday", "national holiday", "optional holiday", "festival leave"],
    "training": ["learning", "development", "L&D", "upskilling", "course", "workshop"],
    "overtime": ["extra hours", "OT", "beyond working hours", "additional time"],
}


def expand_query(query: str) -> str:
    expanded = query
    lower = query.lower()
    for term, synonyms in HR_SYNONYMS.items():
        if term in lower:
            expanded += " " + " ".join(synonyms[:3])
    return expanded


def clean_query(query: str) -> str:
    query = re.sub(r"[^\w\s?]", " ", query)
    return " ".join(query.split()).strip()


def transform_query(query: str) -> str:
    return expand_query(clean_query(query))
