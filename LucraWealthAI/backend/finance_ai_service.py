import json
from datetime import datetime
import warnings
import os
import re
import random
import logging

from flask import Flask, request, jsonify
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

warnings.filterwarnings('ignore')

# --- LOGGING SETUP ---
def setup_logging():
    logger = logging.getLogger('ConversationLogger')
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.FileHandler('conversation_logs.jsonl', mode='a')
        logger.addHandler(handler)
    return logger
conversation_logger = setup_logging()

# === "SUPER AI" FINANCIAL BRAIN ===
def proactive_financial_analysis(user_context: dict) -> str:
    """
    This is the core intelligence. It analyzes the user's full financial situation
    to find the single most important insight to share.
    """
    print("--- Firing SUPER AI Financial Brain ---")
    try:
        transactions = user_context.get("recent_transactions", [])
        balance = user_context.get("balance", 0)
        unpaid_bills = user_context.get("unpaid_bills", [])
        cashback = user_context.get("cashback", 0)
        insights = []

        if not transactions:
            return "To give you the best advice, I need to see some transaction history first. Ask me to analyze your finances again after you've made a few purchases! 📈"

        if cashback > 10:
            insights.append({
                "priority": 1.5, # Higher priority than most other insights
                "text": f"Nice! You've accumulated ${cashback:.2f} in cashback rewards. You can redeem it anytime from the rewards section of the app! 🎁"
            })
        # --- Insight 1: Proactive "Nudge" for Savings ---
        if balance > 1000 and "vacation" in [g.get("name", "").lower() for g in user_context.get("savingsGoals", [])]:
             insights.append({
                "priority": 1, 
                "text": f"Your balance is looking healthy at ${balance:.2f}! Why not throw a little extra, maybe $50, into that vacation savings fund? 🌴"
             })

        # --- Insight 2: Fraud / Anomaly Detection ---
        amounts = [t.get('amount', 0) for t in transactions if t.get('type') in ['payment', 'send']]
        if len(amounts) > 5:
            avg = sum(amounts) / len(amounts)
            std_dev = (sum([(x - avg) ** 2 for x in amounts]) / len(amounts)) ** 0.5
            anomaly_threshold = avg + (2 * std_dev)
            for t in transactions:
                if t.get('amount', 0) > anomaly_threshold and t.get('amount', 0) > 100:
                    insights.append({
                        "priority": 2, 
                        "text": f"Heads up! I noticed a larger-than-usual payment of ${t.get('amount'):.2f} to '{t.get('title')}'. Just wanted to make sure that was you! 🧐"
                    })
                    break

        # --- Insight 3: Habit-Improving Suggestion (like Cleo) ---
        spending_by_category = {}
        for t in transactions:
            if t.get('type') in ['payment', 'send']:
                category = t.get("category", "Uncategorized")
                spending_by_category[category] = spending_by_category.get(category, 0) + t.get('amount', 0)
        
        if spending_by_category.get("Food & Drink", 0) > 100:
             insights.append({
                 "priority": 3,
                 "text": f"I see you've spent over ${spending_by_category['Food & Drink']:.2f} on dining out recently. That's a lot of tasty food! 🍔 A great way to save could be to try cooking at home one more night a week."
             })
        
        # --- Insight 4: Subscription Saver ---
        subscriptions = {}
        sub_keywords = ['netflix', 'spotify', 'hulu', 'gym', 'membership']
        for t in transactions:
            if any(k in t.get("title", "").lower() for k in sub_keywords):
                subscriptions[t.get("title")] = subscriptions.get(t.get("title"), 0) + 1
        recurring_subs = [name for name, count in subscriptions.items() if count > 1]
        if len(recurring_subs) > 1:
            insights.append({
                "priority": 4,
                "text": f"I noticed you have a few recurring subscriptions like {', '.join(recurring_subs)}. It's always a good idea to do a 'sub-scription audit' and cancel any you're not using. 😉"
            })
        
        # --- Insight 5: Low Balance Warning ---
        if balance < 500 and unpaid_bills:
            insights.append({"priority": 5, "text": f"Watch out! Your balance is running a bit low, and you have {len(unpaid_bills)} bills coming up soon. Let's make sure you're covered. 😟"})

        if not insights:
            return "I've scanned your recent activity and everything looks solid. You're managing your finances well! ✨"
        
        highest_priority_insight = min(insights, key=lambda x: x['priority'])
        return highest_priority_insight['text']

    except Exception as e:
        return f"I had an issue running a financial analysis for you. Details: {str(e)}"

# === DIRECT ACTION LOGIC (For the Keyword Router) ===

def create_confirmation_request(action_to_confirm: dict, message: str) -> str:
    return json.dumps({"action": "confirmationRequest", "confirmation": {"message": message, "actionToConfirm": action_to_confirm}})

def pay_bill_logic(bill_name: str, user_context: dict) -> str:
    unpaid_bills = user_context.get("unpaid_bills", [])
    target_bill = next((b for b in unpaid_bills if bill_name.lower().strip() in b.get('name', '').lower()), None)
    if not target_bill: return json.dumps({"action": "error", "message": f"Sorry, I couldn't find an unpaid bill named '{bill_name}'. 😬"})
    action = {"action": "payBill", "payload": {"billId": target_bill.get('id'), "amount": target_bill.get('amount'), "category": target_bill.get('category')}}
    return create_confirmation_request(action, f"You're about to pay the {target_bill.get('name')} bill for ${target_bill.get('amount'):.2f}. Are you sure?")

# --- ADDING BACK THE MISSING ACTION LOGIC ---
def send_money_logic(amount: float, recipient_name: str, user_context: dict) -> str:
    contacts = user_context.get("contacts", [])
    target_contact = next((c for c in contacts if recipient_name.lower() in c.get('name', '').lower()), None)
    if not target_contact:
        return json.dumps({"action": "error", "message": f"I couldn't find '{recipient_name}' in your contacts."})
    action_to_confirm = {"action": "sendMoney", "payload": {"recipient": target_contact.get('name'), "amount": amount}}
    return create_confirmation_request(action_to_confirm, f"You're about to send ${amount:.2f} to {target_contact.get('name')}. Ready to go?")

def add_money_logic(amount: float, user_context: dict) -> str:
    action_to_confirm = {"action": "addMoney", "payload": {"amount": amount}}
    return create_confirmation_request(action_to_confirm, f"You're about to add ${amount:.2f} to your account balance. Sound good?")

# === MAIN AI SERVICE CLASS ===
class FinanceAIService:
    def __init__(self):
        print("Initializing Finance AI Service...")
        self.llm = self.setup_llm()
        self.conversational_chain = self.setup_conversational_chain(self.llm)
        print("\nInitialization complete. Lucra AI is ready.")

    def setup_llm(self):
        print("Setting up Language Model (using Groq Llama3-8b)...")
        if not os.getenv("GROQ_API_KEY"): raise ValueError("GROQ_API_KEY environment variable not set.")
        return ChatGroq(model_name="llama3-8b-8192", temperature=0.2)

    def setup_conversational_chain(self, llm):
        print("Setting up conversational chain...")
        prompt = ChatPromptTemplate.from_template("""
        You are Lina, a witty, savvy, and concise AI financial assistant.
        - Your answers MUST be short (1-3 sentences) and use at least one emoji.
        - Analyze the User's Query and the provided Financial Context to give a helpful, conversational, and ACCURATE answer based ONLY on the data provided.
        - If the context contains a pre-computed insight from our system, present that insight to the user in your own words.
        - Do not just list raw data; summarize it in a friendly and insightful way. Do not invent information.

        Financial Context: {context}
        User's Query: {query}
        """)
        return prompt | llm

    def process_user_query(self, query: str, user_context: dict):
        """The HYBRID SUPER-ROUTER."""
        print(f"Routing query: {query}")
        query_lower = query.lower()
        
        # --- THE FULL, CORRECT KEYWORD ROUTER ---
        if re.search(r'pay(?: my)?\s(.*?)\sbill', query_lower):
            match = re.search(r'pay(?: my)?\s(.*?)\sbill', query_lower)
            if match:
                bill_name = match.group(1).replace('the', '').strip()
                print(f"--- ROUTER: Detected 'pay bill' for: '{bill_name}' ---")
                return {"success": True, "response": pay_bill_logic(bill_name, user_context)}
        
        elif re.search(r'send\s(?:.*?\$)?([\d\.]+)\s.*?\s?to\s(.+)', query_lower):
            match = re.search(r'send\s(?:.*?\$)?([\d\.]+)\s.*?\s?to\s(.+)', query_lower)
            if match:
                amount, recipient_name = float(match.group(1)), match.group(2).strip()
                print(f"--- ROUTER: Detected 'send money': amount=${amount}, recipient='{recipient_name}' ---")
                return {"success": True, "response": send_money_logic(amount, recipient_name, user_context)}

        elif re.search(r'(add|deposit|load)\s.*?(?:\$)?([\d\.]+)', query_lower):
            match = re.search(r'([\d\.]+)', query)
            if match:
                amount = float(match.group(1))
                print(f"--- ROUTER: Detected 'add money': amount=${amount} ---")
                return {"success": True, "response": add_money_logic(amount, user_context)}

        # --- INTELLIGENT ANALYSIS for Conversational Queries ---
        print("--- ROUTER: No simple action detected. Running financial analysis... ---")
        analysis_result = proactive_financial_analysis(user_context)
        return self.run_chat(query, {"analysis_insight": analysis_result, "full_context_for_questions": user_context})

    def run_chat(self, query: str, context: dict):
        print("Passing to conversational chain...")
        try:
            response = self.conversational_chain.invoke({
                "query": query,
                "context": json.dumps(context)
            })
            return {"success": True, "response": response.content, "query": query}
        except Exception as e:
            print(f"Error with conversational chain: {e}")
            return {"success": False, "error": str(e)}

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