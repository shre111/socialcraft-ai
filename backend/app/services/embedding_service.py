"""
Phase 2: Sentence-transformer embeddings for semantic caption similarity.
Loaded lazily to avoid cold-start penalty when embeddings aren't needed.
"""
from __future__ import annotations

_model = None


def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, fast & multilingual-ish
    return _model


def embed(text: str) -> list[float]:
    model = get_model()
    return model.encode(text).tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    import math
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x ** 2 for x in a))
    mag_b = math.sqrt(sum(x ** 2 for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)
