import re
from presidio_analyzer import PatternRecognizer, Pattern

class PANRecognizer(PatternRecognizer):
    PATTERNS = [Pattern("PAN", r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", 0.85)]
    CONTEXT = ["pan", "permanent account", "income tax"]

    def __init__(self):
        super().__init__(supported_entity="IN_PAN", patterns=self.PATTERNS, context=self.CONTEXT)
