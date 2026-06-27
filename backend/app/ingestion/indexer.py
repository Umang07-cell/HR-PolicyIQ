from typing import List, Dict
from qdrant_client.models import PointStruct, SparseVector
from app.db.qdrant_client import get_qdrant
from app.rag.embedder import embed_texts, embed_sparse
from app.core.config import settings
import uuid


def index_chunks(chunks, document_id, document_title, module, access_roles, access_departments, access_locations):
    print(f"INDEX_CHUNKS called: {len(chunks)} chunks, doc_id={document_id}")
    if not chunks:
        return []

    texts = [c["text"] for c in chunks]
    print(f"Embedding {len(texts)} texts...")
    embeddings = embed_texts(texts)
    print(f"Got {len(embeddings)} embeddings, dim={len(embeddings[0])}")

    client = get_qdrant()
    ids = []

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        point_id = str(uuid.uuid4())
        ids.append(point_id)
        
        # Generate sparse vector
        sparse_indices, sparse_values = embed_sparse(chunk["text"])
        
        try:
            client.upsert(
                collection_name=settings.QDRANT_COLLECTION,
                points=[PointStruct(
                    id=point_id,
                    vector={
                        "dense": embedding,
                        "sparse": SparseVector(indices=sparse_indices, values=sparse_values)
                    },
                    payload={
                        "text": chunk["text"],
                        "document_id": document_id,
                        "document_title": document_title,
                        "chunk_index": chunk.get("chunk_index", 0),
                        "page": chunk.get("page"),
                        "module": module,
                        "access_roles": access_roles if access_roles else ["all"],
                        "access_departments": access_departments,
                        "access_departments_open": len(access_departments) == 0,
                        "access_locations": access_locations if access_locations else ["all"],
                    }
                )]
            )
            print(f"SUCCESS: Upserted {i+1}/{len(chunks)}")
        except Exception as e:
            print(f"FAILED UPSERT chunk {i}: {type(e).__name__}: {e}")
            raise

    print(f"Upsert complete — {len(ids)} points stored")
    return ids