from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from rag.news_fetcher import fetch_et_news
import os

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

def build_vector_store():
    print("Fetching ET Markets news...")
    articles = fetch_et_news()

    docs = []
    for a in articles:
        content = f"{a['title']}\n{a['description']}"
        docs.append(Document(
            page_content=content,
            metadata={
                "source": a["source"],
                "link": a["link"],
                "date": a["date"],
                "title": a["title"]
            }
        ))

    print(f"Building FAISS index with {len(docs)} articles...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vector_store = FAISS.from_documents(docs, embeddings)
    print("Vector store ready.")
    return vector_store

# Global instance — built once at startup
_vector_store = None

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        _vector_store = build_vector_store()
    return _vector_store