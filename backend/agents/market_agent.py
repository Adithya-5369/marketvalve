import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from tools.price_fetch import price_fetch
from tools.new_rag import news_rag
from tools.opportunity_radar import opportunity_radar
from tools.chart_pattern import chart_pattern
from groq import RateLimitError

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1
)

tools = [price_fetch, news_rag, opportunity_radar, chart_pattern]
tools_map = {t.name: t for t in tools}
llm_with_tools = llm.bind_tools(tools)

SYSTEM_PROMPT = """You are MarketValve, an intelligent AI assistant
for Indian retail investors.

Rules:
- Use price_fetch for current stock/index prices
- Use news_rag for news queries — call it ONLY ONCE
- Use opportunity_radar for bulk deals, block deals, institutional activity, FII/DII signals
- If opportunity_radar returns no live data, explain why AND still provide insight using available context
- If opportunity_radar finds no deals for a stock, mention total market deals and suggest checking back during market hours
- After getting tool results, ALWAYS give a complete self-contained answer
- Never say "refer to earlier" — include full details in every response
- If no direct data found, say so clearly and provide related context
- Use INR for currency
- NEVER mention tool names, APIs, or internal implementation (e.g., opportunity_radar, price_fetch, news_rag)
- Present all information as if you directly know it
- Always cite sources directly in your response
- Be concise and actionable"""


def run_agent(query: str, portfolio: list = None) -> str:
    context = f"\nUser portfolio: {portfolio}" if portfolio else ""

    query_lower = query.lower()
    '''if any(w in query_lower for w in ["news", "latest", "update", "event", "recent"]):
        active_llm = llm_with_news
    elif any(w in query_lower for w in ["bulk", "block", "deal", "institutional",
                                        "fii", "dii", "insider", "radar", "buying", "selling"]):
        active_llm = llm_with_radar  # ← was llm.bind_tools([opportunity_radar])
    elif any(w in query_lower for w in ["price", "cost", "trading", "rate"]):
        active_llm = llm_with_price
    else:
        active_llm = llm_with_tools '''
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
        content="Now give a complete, self-contained answer using the tool results above. Include all relevant details, signals, and sources directly in your response. Do NOT mention tools, APIs, or how the data was fetched, Speak naturally as a financial assistant, Only include relevant insights."
    ))
    final = llm.invoke(messages)
    return final.content