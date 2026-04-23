import os
import re
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage
from tools.price_fetch import price_fetch
from tools.new_rag import news_rag
from tools.opportunity_radar import opportunity_radar
from tools.chart_pattern import chart_pattern
from tools.mutual_funds import get_top_mutual_funds

load_dotenv()

# Global LLM instance with tools
llm = ChatOpenAI(
    model="sarvam-105b",
    api_key=os.getenv("SARVAM_API_KEY"),
    base_url="https://api.sarvam.ai/v1",
    temperature=0.2
)

tools = [price_fetch, news_rag, opportunity_radar, chart_pattern, get_top_mutual_funds]
tools_map = {t.name: t for t in tools}
llm_with_tools = llm.bind_tools(tools)

conversation_history: list = []
MAX_HISTORY = 10


SYSTEM_PROMPT = """You are MarketValve AI — a next-generation financial intelligence assistant
for Indian retail investors. You are friendly, approachable, and conversational.

Your PRIMARY expertise is Indian stock markets, but you are NOT limited to only financial questions.
If the user asks casual questions (greetings, how are you, general knowledge, opinions, jokes, etc.),
respond naturally and warmly like a helpful friend — then gently steer back to markets if relevant.
NEVER refuse to answer just because a question isn't about stocks. Be human, be relatable.

For FINANCIAL questions, you are BETTER than ET Markets GPT because you have:
1. Deeper data integration (live NSE data, bulk deals, insider trades, filings, management commentary)
2. Multi-step analysis (you can chain multiple tools for comprehensive answers)
3. Portfolio-aware intelligence (you know the user's portfolio and can give personalized advice)
4. Source-cited responses (always cite where data comes from)

Tool usage rules:
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
- Do NOT call tools for casual/non-financial questions — just reply conversationally

SOURCE CITATION rules (for financial answers only):
- End financial responses with a "Sources:" section
- List the data sources used, e.g.: Sources: NSE India (live), ET Markets, Yahoo Finance
- If citing specific news articles, include the title
- For casual/non-financial answers, do NOT add a Sources section

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
- Use emojis for visual indicators: 📈 📉 🟢 🔴 ⚪ 💰 📊 🔍 📋 😊 👋
- Use → for arrows, • for bullet points
- Use line breaks to separate sections
- Write numbers and prices cleanly: ₹2,389.80 not **₹2,389.80**
- Keep responses concise — max 8-10 lines for simple queries, 20-25 for detailed analysis
- Always show reasoning steps for complex financial queries"""


def run_agent(query: str, portfolio: list = None, history: list = None) -> dict:
    """Run MarketValve agent with portfolio and history context."""
    portfolio_ctx = ""
    portfolio_names = []
    if portfolio and len(portfolio) > 0:
        holdings = []
        for h in portfolio:
            if isinstance(h, dict):
                sym = h.get("symbol", h.get("scheme_name", ""))
                qty = h.get("qty", h.get("units", 0))
                avg = h.get("avg_price", h.get("invested", 0))
                holdings.append(f"{sym}: {qty} shares/units @ ₹{avg}")
                if sym: portfolio_names.append(sym)
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
    tool_results_summary = []
    tool_calls_made = 0

    for step in range(8):  # Limited to 8 steps to prevent context explosion
        try:
            response = llm_with_tools.invoke(messages)
            messages.append(response)
        except Exception as e:
            print(f"Agent step error: {e}")
            break

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
                elif tool_name == "opportunity_radar":
                    step_desc += f"Checking deals, filings & insider activity"
                    sources_used.add("NSE India (corporate actions)")
                elif tool_name == "chart_pattern":
                    step_desc += f"Analyzing technical patterns"
                    sources_used.add("Yahoo Finance (historical data)")
                    sources_used.add("Technical Analysis Engine")
                elif tool_name == "get_top_mutual_funds":
                    step_desc += f"Analyzing mutual fund performance"
                    sources_used.add("mfapi.in")

                reasoning_steps.append(step_desc)

                try:
                    result = tools_map[tool_name].invoke(tool_call["args"])
                    # TRUNCATE HUGE TOOLS: opportunity_radar and news_rag can be massive
                    result_str = str(result)
                    if len(result_str) > 3000:
                        result_str = result_str[:2800] + "\n\n[... data truncated for context window ...]"
                    
                    messages.append(ToolMessage(
                        content=result_str,
                        tool_call_id=tool_call["id"]
                    ))
                    tool_results_summary.append(f"Source {tool_name}: {result_str[:1500]}")
                except Exception as e:
                    messages.append(ToolMessage(
                        content=f"Error in tool {tool_name}: {str(e)}",
                        tool_call_id=tool_call["id"]
                    ))

    sources_list = ", ".join(sources_used) if sources_used else "General market data"
    
    # CONSOLIDATED SYNTHESIS CONTEXT
    # Instead of sending all original tool messages (which are huge), we send a fresh synthesis prompt
    # to the LLM with just the necessary info. This avoids Sarvam-105b failing on 20k tokens.
    
    synthesis_context = f"""You have completed your multi-step analysis.
Original User Query: {query}

Data Collected Summary:
{chr(10).join(tool_results_summary)}

NOW, provide your final response to the user.
1. Be detailed and expert. CITE YOUR SOURCES.
2. If they have a portfolio: {", ".join(portfolio_names)}, reference them directly.
3. Suggest clear actionable insights (Buy, Sell, Hold, Risk Flag).
4. Do NOT use markdown bold/headers. Use emojis and plain text.
5. End with: Sources: {sources_list}
"""

    try:
        # Use a fresh message list for synthesis to keep context small and focused
        synthesis_msgs = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=synthesis_context)
        ]
        final = llm.invoke(synthesis_msgs)
        content = final.content or ""
    except Exception as e:
        print(f"Synthesis error: {e}")
        content = ""

    # Sanitize
    content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
    content = re.sub(r'^#{1,4}\s+', '', content, flags=re.MULTILINE)
    content = re.sub(r'```[\s\S]*?```', '', content)
    
    # Better, non-generic fallback if synthesis fails
    if not content.strip():
        pf_text = f" regarding your holdings in {', '.join(portfolio_names)}." if portfolio_names else "."
        content = f"I've completed my analysis{pf_text} The data shows a mix of technical signals and recent institutional deals. I recommend monitoring the current volatility before making fresh entries, while keeping a long-term outlook on your top positions. You can ask me for specific technical patterns for any of these stocks for more detail.\n\nSources: {sources_list}"

    return {
        "response": content,
        "sources": list(sources_used),
        "reasoning_steps": reasoning_steps,
        "tools_used": tool_calls_made,
    }