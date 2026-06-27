from app.rag.query_transform import clean_query, expand_query, transform_query

def test_clean_removes_special_chars():
    assert "hello world" == clean_query("hello! world?").strip() or "hello world" in clean_query("hello! world?")

def test_expand_leave_query():
    expanded = expand_query("how many leave days")
    assert "leave" in expanded.lower()

def test_transform_returns_string():
    assert isinstance(transform_query("what is salary"), str)
