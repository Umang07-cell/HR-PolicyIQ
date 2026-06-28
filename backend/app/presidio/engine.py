from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_anonymizer import AnonymizerEngine

_analyzer: AnalyzerEngine = None
_anonymizer: AnonymizerEngine = None


def get_analyzer() -> AnalyzerEngine:
    global _analyzer
    if _analyzer is None:
        registry = RecognizerRegistry()
        registry.load_predefined_recognizers()

        try:
            from app.presidio.aadhaar_recognizer import AadhaarRecognizer
            registry.add_recognizer(AadhaarRecognizer())
        except Exception:
            pass

        try:
            from app.presidio.pan_recognizer import PANRecognizer
            registry.add_recognizer(PANRecognizer())
        except Exception:
            pass

        try:
            from app.presidio.uan_recognizer import UANRecognizer
            registry.add_recognizer(UANRecognizer())
        except Exception:
            pass

        _analyzer = AnalyzerEngine(registry=registry)
    return _analyzer


def get_anonymizer() -> AnonymizerEngine:
    global _anonymizer
    if _anonymizer is None:
        _anonymizer = AnonymizerEngine()
    return _anonymizer
