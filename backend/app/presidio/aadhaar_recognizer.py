import re
from presidio_analyzer import PatternRecognizer, Pattern

class AadhaarRecognizer(PatternRecognizer):
    PATTERNS = [Pattern("AADHAAR", r"\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b", 0.85)]
    CONTEXT = ["aadhaar", "aadhar", "uid", "uidai"]

    def __init__(self):
        super().__init__(supported_entity="IN_AADHAAR", patterns=self.PATTERNS, context=self.CONTEXT)
