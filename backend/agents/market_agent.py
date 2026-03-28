import os
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from tools.price_fetch import price_fetch
from tools.new_rag import news_rag
from tools.opportunity_radar import opportunity_radar
from tools.chart_pattern import chart_pattern
from tools.mutual_funds import get_top_mutual_funds

load_dotenv()

llm = ChatOpenAI(
    model="sarvam-105b",
    api_key=os.getenv("SARVAM_API_KEY"),
    base_url="https://api.sarvam.ai/v1",
    temperature=0.1
)

tools = [price_fetch, news_rag, opportunity_radar, chart_pattern, get_top_mutual_funds]
tools_map = {t.name: t for t in tools}
llm_with_tools = llm.bind_tools(tools)

conversation_history: list = []
MAX_HISTORY = 10


SYSTEM_PROMPT = """You are MarketValve AI — a next-generation financial intelligence assistant
for Indian retail investors. You are BETTER than ET Markets GPT because you have:
1. Deeper data integration (live NSE data, bulk deals, insider trades, filings, management commentary)
2. Multi-step analysis (you can chain multiple tools for comprehensive answers)
3. Portfolio-aware intelligence (you know the user's portfolio and can give personalized advice)
4. Source-cited responses (always cite where data comes from)

Rules:
- Use price_fetch for current stock/index prices
- Use news_rag for news queries — call it ONLY ONCE
- Use opportunity_radar for bulk deals, block deals, institutional activity, FII/DII signals, insider trades, corporate filings, quarterly results, management commentary, promoter activity
- Use chart_pattern for technical analysis, chart patterns, RSI, MACD, support/resistance, backtest data
- Use get_top_mutual_funds WHENEVER the user asks for mutual fund names, best mutual funds, or recommendations.
- You can call MULTIPLE tools in sequence for a comprehensive analysis (multi-step reasoning)
- If the user has a portfolio, proactively mention how data relates to their holdings
- After getting tool results, ALWAYS give a complete self-contained answer
- If no direct data found, say so clearly and provide related context
- Use INR for currency
- NEVER mention tool names, APIs, or internal implementation
- Present all information as if you directly know it

SOURCE CITATION rules (IMPORTANT):
- Always end your response with a "Sources:" section
- List the data sources used, e.g.: Sources: NSE India (live), ET Markets, Moneycontrol, Yahoo Finance
- If citing specific news articles, include the title
- This is a KEY differentiator from ET's Market ChatGPT — always cite sources

PORTFOLIO-AWARE rules:
- When the user has shared their portfolio, reference it naturally
- Example: "Since you hold 50 shares of TCS, this signal is relevant to your position"
- Proactively flag risks/opportunities that affect their holdings
- If a deal or signal involves a stock they hold, highlight it prominently

MULTI-STEP ANALYSIS rules:
- For complex queries, break your analysis into clear steps
- Use numbered steps: Step 1: ..., Step 2: ..., Step 3: ...
- Show your reasoning chain clearly — this demonstrates deeper analysis than competing products
- Example: "Step 1: Checking current price... Step 2: Analyzing technical patterns... Step 3: Scanning for recent deals..."

Formatting rules (IMPORTANT):
- Do NOT use markdown formatting — no **, no ##, no ###, no ```
- Use plain text only
- Use emojis for visual indicators: 📈 📉 🟢 🔴 ⚪ 💰 📊 🔍 📋
- Use → for arrows, • for bullet points
- Use line breaks to separate sections
- Write numbers and prices cleanly: ₹2,389.80 not **₹2,389.80**
- Keep responses concise — max 8-10 lines for simple queries, 20-25 for detailed analysis
- Always show reasoning steps for complex queries"""


def run_agent(query: str, portfolio: list = None, history: list = None) -> dict:
    """
    Run the MarketValve agent with conversation history and portfolio context.
    Returns a dict with 'response', 'sources', and 'reasoning_steps'.
    """
    portfolio_ctx = ""
    if portfolio and len(portfolio) > 0:
        holdings = []
        for h in portfolio:
            if isinstance(h, dict):
                sym = h.get("symbol", "")
                qty = h.get("qty", 0)
                avg = h.get("avg_price", 0)
                holdings.append(f"{sym}: {qty} shares @ ₹{avg}")
            else:
                holdings.append(str(h))
        portfolio_ctx = f"\n\nUser's Portfolio:\n" + "\n".join(holdings)
        portfolio_ctx += "\n\nIMPORTANT: Reference the user's holdings when relevant. Flag any signals, deals, or news that affect stocks in their portfolio."

    history_msgs = []
    if history and len(history) > 0:
        for entry in history[-MAX_HISTORY:]:
            role = entry.get("role", "")
            content = entry.get("content", "")
            if role == "user":
                history_msgs.append(HumanMessage(content=content))
            elif role == "assistant":
                history_msgs.append(SystemMessage(content=f"[Previous response]: {content[:500]}"))

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
    ]
    messages.extend(history_msgs)
    messages.append(HumanMessage(content=query + portfolio_ctx))

    sources_used = set()
    reasoning_steps = []
    tool_calls_made = 0

    for step in range(5):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_calls_made += 1

            if tool_name in tools_map:
                step_desc = f"Step {tool_calls_made}: "
                if tool_name == "price_fetch":
                    step_desc += f"Fetching live price data"
                    sources_used.add("NSE India (live prices)")
                elif tool_name == "news_rag":
                    step_desc += f"Scanning market news"
                    sources_used.add("ET Markets")
                    sources_used.add("Moneycontrol")
                elif tool_name == "opportunity_radar":
                    step_desc += f"Checking deals, filings & insider activity"
                    sources_used.add("NSE India (corporate actions)")
                elif tool_name == "chart_pattern":
                    step_desc += f"Analyzing technical patterns"
                    sources_used.add("Yahoo Finance (historical data)")
                    sources_used.add("Technical Analysis Engine")

                reasoning_steps.append(step_desc)

                result = tools_map[tool_name].invoke(tool_call["args"])
                messages.append(ToolMessage(
                    content=str(result),
                    tool_call_id=tool_call["id"]
                ))

    sources_list = ", ".join(sources_used) if sources_used else "General knowledge"
    
    synthesis = f"""Now give a complete, self-contained answer using the tool results above.

IMPORTANT REQUIREMENTS:
1. Include all relevant details, signals, and data directly in your response
2. Do NOT mention tools, APIs, or how the data was fetched — speak naturally
3. If the user has a portfolio, reference their holdings where relevant
4. Show your multi-step reasoning clearly with "Step 1:", "Step 2:", etc.
5. End EVERY response with:
   Sources: {sources_list}
6. Do NOT use any markdown formatting like ** or ## or ### — use plain text with emojis and bullet points (•) only
7. If you performed multiple analysis steps, present them as a clear reasoning chain"""

    messages.append(HumanMessage(content=synthesis))
    final = llm_with_tools.invoke(messages)

    content = final.content
    content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
    content = re.sub(r'^#{1,4}\s+', '', content, flags=re.MULTILINE)
    content = re.sub(r'```[\s\S]*?```', '', content)

    return {
        "response": content,
        "sources": list(sources_used),
        "reasoning_steps": reasoning_steps,
        "tools_used": tool_calls_made,
    }