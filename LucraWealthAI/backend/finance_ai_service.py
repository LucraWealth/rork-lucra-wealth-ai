import json
from datetime import datetime
import warnings
import os
import re
import logging # <-- NEW: Import the logging library

from flask import Flask, request, jsonify
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

warnings.filterwarnings('ignore')

# --- NEW LOGGING SETUP ---
def setup_logging():
    """Sets up a JSON logger to write conversation details to a file."""
    logger = logging.getLogger('ConversationLogger')
    logger.setLevel(logging.INFO)
    
    # Prevent duplicate handlers if this function is called multiple times
    if not logger.handlers:
        # Create a file handler to write logs to a file
        # 'a' means append to the file
        handler = logging.FileHandler('conversation_logs.jsonl', mode='a')
        
        # We don't need a formatter because we will log pre-formatted JSON strings
        logger.addHandler(handler)
        
    return logger

# Create the logger instance when the application starts
conversation_logger = setup_logging()


# === ACTION LOGIC FUNCTIONS (No changes here) ===

def create_confirmation_request(action_to_confirm: dict, confirmation_message: str) -> str:
    # ... (function is correct and remains the same)
    return json.dumps({
        "action": "confirmationRequest",
        "confirmation": {"message": confirmation_message, "actionToConfirm": action_to_confirm},
        "confirmation_message": "Just want to double-check with you first. 👍"
    })

def pay_bill_logic(bill_name: str, user_context: dict) -> str:
    # ... (function is correct and remains the same)
    unpaid_bills = user_context.get("unpaid_bills", [])
    target_bill = next((b for b in unpaid_bills if bill_name.lower().strip() in b.get('name', '').lower()), None)
    
    if not target_bill:
        return json.dumps({"action": "error", "message": f"Sorry, I couldn't find an unpaid bill named '{bill_name}'. 😬"})
    
    action_to_confirm = {"action": "payBill", "payload": {"billId": target_bill.get('id'), "amount": target_bill.get('amount'), "category": target_bill.get('category')}}
    return create_confirmation_request(action_to_confirm, f"You're about to pay the {target_bill.get('name')} bill for ${target_bill.get('amount'):.2f}. Is that correct?")

def send_money_logic(amount: float, recipient_name: str, user_context: dict) -> str:
    # ... (function is correct and remains the same)
    contacts = user_context.get("contacts", [])
    target_contact = next((c for c in contacts if recipient_name.lower() in c.get('name', '').lower()), None)
    
    if not target_contact:
        return json.dumps({"action": "error", "message": f"I couldn't find '{recipient_name}' in your contacts."})
    
    action_to_confirm = {"action": "sendMoney", "payload": {"recipient": target_contact.get('name'), "amount": amount}}
    return create_confirmation_request(action_to_confirm, f"You're about to send ${amount:.2f} to {target_contact.get('name')}. Ready to go?")

def add_money_logic(amount: float, user_context: dict) -> str:
    # ... (function is correct and remains the same)
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
        if not os.getenv("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY environment variable not set.")
        return ChatGroq(model_name="llama3-8b-8192", temperature=0.2)

    def setup_conversational_chain(self, llm):
        print("Setting up conversational chain...")
        prompt = ChatPromptTemplate.from_template("""
        You are Lina, a witty, savvy, and concise AI financial assistant.
        - Your answers MUST be short (1-3 sentences) and use at least one emoji.
        - Analyze the User's Query and the provided Financial Context to give a helpful, conversational answer.
        - Do not just list raw data; summarize it in a friendly and insightful way.

        User's Financial Context:
        {context}

        User's Query:
        {query}
        """)
        return prompt | llm

    def process_user_query(self, query: str, user_context: dict):
        print(f"Routing query: {query}")
        query_lower = query.lower()
        
        pay_keywords = ['pay']
        bill_keywords = ['bill', 'invoice']
        send_keywords = ['send', 'transfer']
        add_keywords = ['add', 'deposit', 'load']

        if any(word in query_lower for word in pay_keywords) and any(word in query_lower for word in bill_keywords):
            try:
                match = re.search(r'pay(?: my)?\s(.*?)\sbill', query_lower)
                if match:
                    bill_name = match.group(1).strip()
                    # --- NEW: Log the detected action ---
                    log_data = {"timestamp": datetime.now().isoformat(), "type": "action_triggered", "action": "pay_bill", "extracted_bill_name": bill_name}
                    conversation_logger.info(json.dumps(log_data))
                    return {"success": True, "response": pay_bill_logic(bill_name, user_context)}
            except Exception:
                pass

        elif any(word in query_lower for word in send_keywords) and any(char.isdigit() for char in query):
             try:
                match = re.search(r'send\s(?:.*?\$)?([\d\.]+)\s(?:dollars|bucks)?\s?to\s(.+)', query_lower)
                if match:
                    amount = float(match.group(1))
                    recipient_name = match.group(2).strip()
                    # --- NEW: Log the detected action ---
                    log_data = {"timestamp": datetime.now().isoformat(), "type": "action_triggered", "action": "send_money", "extracted_amount": amount, "extracted_recipient": recipient_name}
                    conversation_logger.info(json.dumps(log_data))
                    return {"success": True, "response": send_money_logic(amount, recipient_name, user_context)}
             except Exception:
                pass

        elif ('add' in query_lower or 'deposit' in query_lower) and any(char.isdigit() for char in query):
            try:
                match = re.search(r'([\d\.]+)', query_lower)
                if match:
                    amount = float(match.group(1))
                    # --- NEW: Log the detected action ---
                    log_data = {"timestamp": datetime.now().isoformat(), "type": "action_triggered", "action": "add_money", "extracted_amount": amount}
                    conversation_logger.info(json.dumps(log_data))
                    return {"success": True, "response": add_money_logic(amount, user_context)}
            except Exception as e:
                pass

        return self.run_chat(query, user_context)

    def run_chat(self, query: str, user_context: dict):
        print("Passing to conversational chain...")
        try:
            # --- NEW: Log the AI's "Thought Process" (the full prompt) ---
            prompt_input = {"query": query, "context": json.dumps(user_context)}
            log_data = {"timestamp": datetime.now().isoformat(), "type": "llm_input", "prompt_sent_to_llm": prompt_input}
            conversation_logger.info(json.dumps(log_data))

            response = self.conversational_chain.invoke(prompt_input)
            
            return {"success": True, "response": response.content, "query": query}
        except Exception as e:
            print(f"Error with conversational chain: {e}")
            return {"success": False, "error": str(e), "query": query}

# --- Flask App ---
app = Flask(__name__)
ai_service = FinanceAIService()

@app.route('/api/ai/query', methods=['POST'])
def handle_query():
    data = request.json
    query, user_context = data.get('query'), data.get('user_context')
    if not query: return jsonify({"success": False, "error": "Query is empty."}), 400

    # --- NEW: Log the initial user request ---
    log_data = {"timestamp": datetime.now().isoformat(), "type": "user_request", "query": query, "context_received": bool(user_context)}
    conversation_logger.info(json.dumps(log_data))

    result = ai_service.process_user_query(query, user_context)

    # --- NEW: Log the final response sent to the app ---
    log_data = {"timestamp": datetime.now().isoformat(), "type": "final_response", "response_sent": result}
    conversation_logger.info(json.dumps(log_data))

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)