from presidio_analyzer import PatternRecognizer, Pattern

class SalaryRecognizer(PatternRecognizer):
    PATTERNS = [
        Pattern("SALARY_INR", r"(?:₹|INR|Rs\.?)\s*[\d,]+(?:\.\d{2})?", 0.75),
        Pattern("SALARY_LPA", r"\b\d+(?:\.\d+)?\s*(?:LPA|lpa|L\.P\.A)", 0.8),
    ]
    CONTEXT = ["salary", "ctc", "compensation", "package", "pay", "lpa"]

    def __init__(self):
        super().__init__(supported_entity="IN_SALARY", patterns=self.PATTERNS, context=self.CONTEXT)
