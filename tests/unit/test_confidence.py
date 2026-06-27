from app.rag.confidence import compute_confidence

def test_empty_chunks(): assert compute_confidence([]) == 0.0
def test_high_confidence(): assert compute_confidence([{"score": 0.9}, {"score": 0.85}, {"score": 0.8}]) > 0.5
def test_low_confidence(): assert compute_confidence([{"score": 0.5}, {"score": 0.51}]) < 0.1
def test_single_chunk(): assert 0.0 <= compute_confidence([{"score": 0.7}]) <= 1.0
