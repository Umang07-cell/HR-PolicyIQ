from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_anonymizer import AnonymizerEngine
from app.presidio.aadhaar_recognizer import AadhaarRecognizer
from app.presidio.pan_recognizer import PANRecognizer
from app.presidio.uan_recognizer import UANRecognizer
from app.presidio.salary_recognizer import SalaryRecognizer


_analyzer = None
_anonymizer = None

def get_analyzer() -> AnalyzerEngine:
    global _analyzer
    if _analyzer is None:
        registry = RecognizerRegistry()
        registry.load_predefined_recognizers()
        registry.add_recognizer(AadhaarRecognizer())
        registry.add_recognizer(PANRecognizer())
        registry.add_recognizer(UANRecognizer())
        registry.add_recognizer(SalaryRecognizer())
        _analyzer = AnalyzerEngine(registry=registry)
    return _analyzer

def get_anonymizer() -> AnonymizerEngine:
    global _anonymizer
    if _anonymizer is None:
        _anonymizer = AnonymizerEngine()
    return _anonymizer

def analyze_and_anonymize(text: str) -> str:
    try:
        analyzer = get_analyzer()
        anonymizer = get_anonymizer()
        results = analyzer.analyze(text=text, language="en")
        if not results:
            return text
        return anonymizer.anonymize(text=text, analyzer_results=results).text
    except Exception:
        return text
