from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
import traceback
from langchain_core.tools import tool
from rag.vector_store import get_vector_store

@tool
def news_rag(query: str) -> str:
    """Searches latest ET Markets news articles relevant to the query."""
    try:
        vs = get_vector_store()
        results = vs.similarity_search(query, k=5)
        cutoff = datetime.now(tz=datetime.now().astimezone().tzinfo) - timedelta(days=7)

        def is_recent(doc):
            try:
                date_str = doc.metadata.get("date", "")
                if not date_str:
                    return True
                parsed = parsedate_to_datetime(date_str)
                return parsed > cutoff
            except:
                return True

        results = [r for r in results if is_recent(r)]

        if not results:
            return "No relevant recent news found for this query."

        output = "Relevant ET Markets News:\n\n"
        for i, doc in enumerate(results, 1):
            output += f"{i}. {doc.metadata.get('title', 'No title')}\n"
            output += f"   {doc.page_content[:300]}...\n"
            output += f"   Source: {doc.metadata.get('source')} | {doc.metadata.get('date', '')}\n"
            output += f"   Link: {doc.metadata.get('link', '')}\n\n"

        # Tell LLM explicitly if no direct match found
        keywords = query.lower().split()
        has_direct_match = any(
            any(kw in doc.metadata.get('title', '').lower() for kw in keywords)
            for doc in results
        )
        if not has_direct_match:
            output += "Note: No articles directly mentioning this stock were found today. Showing related market news instead."

        return output
    except Exception as e:
        traceback.print_exc()
        return f"Error fetching news: {str(e)}"