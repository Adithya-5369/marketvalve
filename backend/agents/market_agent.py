import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from tools.price_fetch import price_fetch
from tools.new_rag import news_rag

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1
)

tools = [price_fetch, news_rag]
tools_map = {t.name: t for t in tools}

llm_with_price = llm.bind_tools([price_fetch])
llm_with_news = llm.bind_tools([news_rag])
llm_with_tools = llm.bind_tools([price_fetch, news_rag])

SYSTEM_PROMPT = """You are MarketValve, an intelligent AI assistant
for Indian retail investors.

Rules:
- Use price_fetch tool for current stock prices
- Use news_rag tool for news queries — call it ONLY ONCE
- After getting tool results, ALWAYS summarize the actual content in your response
- NEVER say "refer to earlier" or "as mentioned" — always include the full answer
- If no direct stock news found, summarize the related market news returned
- Use INR for currency
- Always cite article titles and links directly in your response
- Be concise and actionable"""

def run_agent(query: str, portfolio: list = None) -> str:
    context = f"\nUser portfolio: {portfolio}" if portfolio else ""
    
    # Route to correct tool based on query keywords
    query_lower = query.lower()
    if any(w in query_lower for w in ["news", "latest", "update", "event", "recent"]):
        active_llm = llm_with_news
    elif any(w in query_lower for w in ["price", "cost", "trading", "rate"]):
        active_llm = llm_with_price
    else:
        active_llm = llm_with_tools

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=query + context)
    ]

    for _ in range(3):
        response = active_llm.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            if tool_name in tools_map:
                result = tools_map[tool_name].invoke(tool_call["args"])
                messages.append(ToolMessage(
                    content=str(result),
                    tool_call_id=tool_call["id"]
                ))

    messages.append(HumanMessage(
        content="Now give a complete, self-contained answer using the tool results above. Include article titles and links directly in your response."
    ))
    final = llm.invoke(messages)
    return final.content