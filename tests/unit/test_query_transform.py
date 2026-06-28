"""Unit tests for query transformation."""
from app.rag.query_transform import clean_query, expand_query, transform_query


def test_clean_removes_special_chars():
    result = clean_query("hello! world?")
    assert "!" not in result
    assert "hello" in result
    assert "world" in result


def test_clean_collapses_whitespace():
    assert clean_query("  too   many   spaces  ") == "too many spaces"


def test_expand_leave_query():
    expanded = expand_query("how many leave days")
    assert "leave" in expanded.lower()
    # Should include synonyms
    assert len(expanded) > len("how many leave days")


def test_expand_salary_query():
    expanded = expand_query("what is my salary")
    assert "salary" in expanded.lower()
    assert any(word in expanded.lower() for word in ["compensation", "pay", "ctc"])


def test_expand_no_match_unchanged():
    text = "explain the onboarding process"
    expanded = expand_query(text)
    # onboarding should expand
    assert "joining" in expanded.lower() or "induction" in expanded.lower()


def test_transform_returns_string():
    assert isinstance(transform_query("what is salary"), str)


def test_transform_non_empty():
    assert len(transform_query("leave policy")) > 0


def test_transform_cleans_before_expanding():
    result = transform_query("  what is!! my SALARY??  ")
    assert "!!" not in result
    assert "??" not in result


def test_expand_grievance_query():
    expanded = expand_query("I have a complaint about my manager")
    assert any(w in expanded.lower() for w in ["grievance", "dispute", "concern"])
