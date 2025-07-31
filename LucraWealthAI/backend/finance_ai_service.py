import json
from datetime import datetime
import warnings
import os
import glob

from flask import Flask, request, jsonify
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.agents import Tool, initialize_agent, AgentType
from langchain_groq import ChatGroq
import chromadb
from chromadb.config import Settings

warnings.filterwarnings('ignore')

# === TOOL FUNCTIONS (Now standalone helpers) ===

def pay_single_bill_logic(bill_name: str, user_context: dict) -> str:
    """This function contains the logic to find and pay a single bill."""
    try:
        unpaid_bills = user_context.get("unpaid_bills", [])
        target_bill = next((b for b in unpaid_bills if bill_name.lower().strip() in b.get('name', '').lower()), None)

        if not target_bill:
            return json.dumps({"action": "error", "message": f"Sorry, I couldn't find an unpaid bill named '{bill_name}'."})

        return json.dumps({
            "action": "payBill",
            "payload": {
                "billId": target_bill.get('id'),
                "amount": target_bill.get('amount'),
                "category": target_bill.get('category')
            },
            "confirmation_message": f"All set! 💸 Your {target_bill.get('name')} bill for ${target_bill.get('amount')} has been paid."
        })
    except Exception as e:
        return json.dumps({"action": "error", "message": f"An error occurred: {str(e)}"})

# === MAIN AI SERVICE CLASS ===
class FinanceAIService:
    def __init__(self):
        print("Initializing Finance AI Service...")
        self.llm = self.setup_llm()
        # The agent is now ONLY for conversation.
        self.conversational_agent = self.setup_conversational_agent(self.llm)
        print("\nInitialization complete. Lucra AI is ready and listening.")

    def setup_llm(self):
        print("Setting up Language Model (using Groq Llama3-8b)...")
        if not os.getenv("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY environment variable not set.")
        return ChatGroq(model_name="llama3-8b-8192", temperature=0.2)

    def setup_conversational_agent(self, llm):
        print("Setting up conversational agent...")
        # This agent has NO tools. Its only job is to chat.
        tools = []
        return initialize_agent(tools, llm, agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION, verbose=True)

    # In finance_ai_service.py

    def process_user_query(self, query: str, user_context: dict):
        """
        This is the new main router. It decides if the query is an ACTION or a CHAT.
        """
        print(f"Routing query: {query}")
        
        query_lower = query.lower()
        
        # --- Keyword-Based Routing for Paying Bills ---
        pay_keywords = ['pay']
        bill_keywords = ['bill', 'invoice']
        
        if any(word in query_lower for word in pay_keywords) and any(word in query_lower for word in bill_keywords):
            # A more robust way to find the bill name
            # It assumes the bill name is between "pay" and "bill"
            try:
                words = query_lower.split()
                start_index = -1
                end_index = -1

                for i, word in enumerate(words):
                    if word in pay_keywords and start_index == -1:
                        start_index = i
                    if word in bill_keywords:
                        end_index = i
                
                if 0 <= start_index < end_index:
                    bill_name = " ".join(words[start_index + 1 : end_index]).replace("my", "").strip()
                else:
                    # Fallback for simple cases like "Pay electricity bill"
                    bill_name = words[1]

                print(f"Detected 'pay bill' command for: '{bill_name}'")
                result = pay_single_bill_logic(bill_name, user_context)
                return {"success": True, "response": result, "query": query}
            except Exception:
                return self.run_chat(query, user_context) # Fallback to chat if parsing fails

        else:
            # If it's not a direct action, let the agent handle the conversation.
            return self.run_chat(query, user_context)
        """
        This is the new main router. It decides if the query is an ACTION or a CHAT.
        """
        print(f"Routing query: {query}")
        
        # --- KEYWORD-BASED ROUTING ---
        # This is a simple but robust way to detect actions.
        query_lower = query.lower()
        if 'pay' in query_lower and 'bill' in query_lower:
            # Extract the bill name (simple version)
            # e.g., "Pay my electricity bill" -> "electricity"
            words = query_lower.split()
            try:
                bill_keyword_index = words.index('bill')
                bill_name_keywords = words[bill_keyword_index - 2:bill_keyword_index] # e.g., ["electricity"]
                bill_name = " ".join(bill_name_keywords).replace("my", "").strip()

                print(f"Detected 'pay bill' command for: {bill_name}")
                # Call the logic function directly, bypassing the agent for actions.
                result = pay_single_bill_logic(bill_name, user_context)
                return {"success": True, "response": result, "query": query}
            except ValueError:
                 # Fallback if we can't find the bill name
                 return self.run_chat(query, user_context)

        else:
            # If it's not a direct action, let the agent handle the conversation.
            return self.run_chat(query, user_context)

    def run_chat(self, query: str, user_context: dict):
        print("Passing to conversational agent...")
        try:
            prompt = f"""
            You are Lina, a witty, concise, and helpful AI assistant.
            Use emojis. Keep answers to 1-3 sentences.

            User's Query: "{query}"
            User's Financial Info (for context, do not mention it unless asked): {json.dumps(user_context)}
            """
            response = self.conversational_agent.invoke({"input": prompt, "chat_history": []})
            return {"success": True, "response": response['output'], "query": query}
        except Exception as e:
            print(f"Error with conversational agent: {e}")
            return {"success": False, "error": str(e), "query": query}

# --- Flask App ---
app = Flask(__name__)
ai_service = FinanceAIService()

@app.route('/api/ai/query', methods=['POST'])
def handle_query():
    data = request.json
    query, user_context = data.get('query'), data.get('user_context')
    if not query:
        return jsonify({"success": False, "error": "Query cannot be empty."}), 400
    # The main process_user_query function now handles everything.
    return jsonify(ai_service.process_user_query(query, user_context))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)