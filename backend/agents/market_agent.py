import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from tools.price_fetch import price_fetch

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1
)

llm_with_tools = llm.bind_tools([price_fetch])

SYSTEM_PROMPT = """You are MarketValve, an intelligent AI assistant
for Indian retail investors.

Rules:
- Always use price_fetch tool to get real data before answering
- Never guess or make up stock prices
- Use INR for currency
- Cite your source in every response
- Be concise and actionable"""

def run_agent(query: str, portfolio: list = None) -> str:
    context = f"\nUser portfolio: {portfolio}" if portfolio else ""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=query + context)
    ]

    response = llm_with_tools.invoke(messages)
    messages.append(response)

    if response.tool_calls:
        for tool_call in response.tool_calls:
            if tool_call["name"] == "price_fetch":
                result = price_fetch.invoke(tool_call["args"])
                messages.append(ToolMessage(
                    content=str(result),
                    tool_call_id=tool_call["id"]
                ))
        final = llm.invoke(messages)
        return final.content

    return response.content