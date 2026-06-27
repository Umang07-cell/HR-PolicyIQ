from presidio_analyzer import PatternRecognizer, Pattern

class UANRecognizer(PatternRecognizer):
    PATTERNS = [Pattern("UAN", r"\b[0-9]{12}\b", 0.6)]
    CONTEXT = ["uan", "universal account", "epfo", "provident fund"]

    def __init__(self):
        super().__init__(supported_entity="IN_UAN", patterns=self.PATTERNS, context=self.CONTEXT)
