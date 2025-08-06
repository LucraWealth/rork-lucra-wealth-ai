import json
from datetime import datetime
import warnings
import os
import re
import logging
import random

from flask import Flask, request, jsonify
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain.tools import tool

warnings.filterwarnings('ignore')

# This global variable is the key to fixing the context-passing bug for our agent.
_request_context = {}

# === "SUPER AI" ANALYSIS TOOLS (For the Intelligent Agent) ===

@tool
def savings_and_subscription_analyzer() -> str:
    """
    Analyzes user transactions to find recurring subscriptions and identify potential savings opportunities.
    This tool should be used when the user asks 'How can I save money?', to analyze spending, or for a financial summary.
    """
    print("--- Firing SUPER AI Tool: Savings & Subscription Analyzer ---")
    user_context = _request_context.get('context', {})
    transactions = user_context.get("recent_transactions", [])
    if not transactions:
        return "To find savings for you, I need to see some transaction history first! 📈"

    subscriptions = {}
    sub_keywords = ['netflix', 'spotify', 'hulu', 'disney+', 'prime', 'gym', 'membership', 'plus']
    for t in transactions:
        title_lower = t.get("title", "").lower()
        if any(keyword in title_lower for keyword in sub_keywords):
            merchant = t.get("title")
            if merchant in subscriptions: subscriptions[merchant]['count'] += 1
            else: subscriptions[merchant] = {'count': 1, 'amount': t.get('amount', 0)}
    
    recurring_subs = {name: data for name, data in subscriptions.items() if data['count'] > 1}
    if not recurring_subs:
        return "I scanned for recurring subscriptions and didn't find any obvious ones to cut back on. That's some good self-control! 👍"
    
    total_sub_cost = sum(data['amount'] for data in recurring_subs.values())
    sub_names = ", ".join(recurring_subs.keys())
    return (f"I found {len(recurring_subs)} potential recurring subscriptions like {sub_names}, "
            f"costing about ${total_sub_cost:.2f} a month. A quick review of these is a pro-gamer move for saving money! 😉")

@tool
def spending_analyzer() -> str:
    """
    Analyzes the user's spending habits to find their top spending categories and provide insights.
    Use this for questions about summarizing spending or detailed expense reports.
    """
    print("--- Firing SUPER AI Tool: Spending Analyzer ---")
    user_context = _request_context.get('context', {})
    transactions = user_context.get("recent_transactions", [])
    if not transactions: return "No recent transactions to analyze."
    
    spending_by_category = {}
    for t in transactions:
        if t.get('type') in ['payment', 'send', 'withdrawal']:
            category = t.get("category", "Uncategorized")
            spending_by_category[category] = spending_by_category.get(category, 0) + t.get('amount', 0)
    
    if not spending_by_category: return "I don't see any recent spending to summarize for you."

    top_category = max(spending_by_category, key=spending_by_category.get)
    top_amount = spending_by_category[top_category]
    return f"Looks like your top spending area lately was '{top_category}' at ${top_amount:.2f}. That's where your money is going the most! 💸"

@tool
def get_specific_financial_info(query: str) -> str:
    """
    Use this tool as a fallback to answer simple, specific questions about the user's financial data,
    such as 'what was my last transaction' or 'what is my balance'.
    """
    print(f"--- Firing SUPER AI Tool: Get Specific Info for query: {query} ---")
    user_context = _request_context.get('context', {})
    query_lower = query.lower()
    
    if "last transaction" in query_lower:
        last_tx = user_context.get("recent_transactions", [None])[0]
        if not last_tx: return "I couldn't find any recent transactions."
        return f"Your last transaction was for ${last_tx.get('amount', 0):.2f} to {last_tx.get('title')} on {last_tx.get('date')}. 💳"
    if "balance" in query_lower:
        balance = user_context.get('balance', 0)
        return f"Your current balance is ${balance:.2f}. Looking good! 💰"
    if "upcoming bills" in query_lower:
        unpaid_bills = user_context.get("unpaid_bills", [])
        if not unpaid_bills: return "You have no upcoming unpaid bills. Nice work! 🎉"
        bill_list = "\n".join([f"* {b.get('name')} for ${b.get('amount', 0):.2f}" for b in unpaid_bills])
        return f"Here are your upcoming bills:\n{bill_list}"
        
    return "I have analyzed the user's data and can answer specific questions about it."

# === DIRECT ACTION LOGIC (For the Keyword Router) ===

def create_confirmation_request(action_to_confirm: dict, message: str) -> str:
    return json.dumps({"action": "confirmationRequest", "confirmation": {"message": message, "actionToConfirm": action_to_confirm}})

def pay_bill_logic(bill_name: str, user_context: dict) -> str:
    unpaid_bills = user_context.get("unpaid_bills", [])
    target_bill = next((b for b in unpaid_bills if bill_name.lower().strip() in b.get('name', '').lower()), None)
    if not target_bill: return json.dumps({"action": "error", "message": f"Sorry, I couldn't find an unpaid bill named '{bill_name}'. 😬"})
    action = {"action": "payBill", "payload": {"billId": target_bill.get('id'), "amount": target_bill.get('amount'), "category": target_bill.get('category')}}
    return create_confirmation_request(action, f"You're about to pay the {target_bill.get('name')} bill for ${target_bill.get('amount'):.2f}. Are you sure?")

# === MAIN AI SERVICE CLASS ===
class FinanceAIService:
    def __init__(self):
        print("Initializing Finance AI Service...")
        self.llm = self.setup_llm()
        self.analysis_agent = self.setup_analysis_agent(self.llm)
        print("\nInitialization complete. Lucra AI is ready.")

    def setup_llm(self):
        print("Setting up Language Model (using Groq Llama3-8b)...")
        if not os.getenv("GROQ_API_KEY"): raise ValueError("GROQ_API_KEY not set.")
        return ChatGroq(model_name="llama3-8b-8192", temperature=0)

    def setup_analysis_agent(self, llm):
        print("Setting up Analysis Agent...")
        tools = [spending_analyzer, savings_and_subscription_analyzer, get_specific_financial_info]
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are Lina, an expert financial analyst AI. Your personality is witty, sharp, and concise.
            - Your final answers MUST be short (1-3 sentences) and use at least one emoji.
            - Your ONLY job is to analyze the user's query and decide which of your available analysis tools is the most appropriate to provide a helpful insight. Do not chat. Just call the best tool.
            """),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ])
        agent = create_tool_calling_agent(llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

    def process_user_query(self, query: str, user_context: dict):
        global _request_context
        _request_context = {'context': user_context}
        print(f"Routing query: {query}")
        query_lower = query.lower()
        
        # --- STEP 1: Fast Keyword Router for Simple Actions ---
        if re.search(r'pay(?: my)?\s(.*?)\sbill', query_lower):
            match = re.search(r'pay(?: my)?\s(.*?)\sbill', query_lower)
            if match:
                bill_name = match.group(1).replace('the', '').strip()
                print(f"--- ROUTER: Detected 'pay bill' for: '{bill_name}' ---")
                return {"success": True, "response": pay_bill_logic(bill_name, user_context)}
        
        # --- STEP 2: Fallback to the Intelligent Analysis Agent ---
        print("--- ROUTER: No simple action detected. Passing to Analysis Agent. ---")
        try:
            response = self.analysis_agent.invoke({"input": query})
            return {"success": True, "response": response['output'], "query": query}
        except Exception as e:
            print(f"Error with analysis agent: {e}")
            return {"success": False, "error": str(e)}
        finally:
            _request_context = {}

# --- Flask App ---
app = Flask(__name__)
ai_service = FinanceAIService()

@app.route('/api/ai/query', methods=['POST'])
def handle_query():
    data = request.json
    query, user_context = data.get('query'), data.get('user_context')
    if not query: return jsonify({"success": False, "error": "Query is empty."}), 400
    return jsonify(ai_service.process_user_query(query, user_context))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)