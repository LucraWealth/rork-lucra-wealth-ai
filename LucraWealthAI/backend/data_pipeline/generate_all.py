import os
from .generate_transactions import generate_transactions, save_transactions_to_csv
from .generate_conversations import generate_conversations, save_conversations_to_jsonl

# Define output directories
BASE_OUTPUT_DIR = 'training_data'
CORE_QA_DIR = os.path.join(BASE_OUTPUT_DIR, 'core_qa')
TRANSACTIONS_DIR = os.path.join(BASE_OUTPUT_DIR, 'transaction_categorization')
CONVERSATIONS_DIR = os.path.join(BASE_OUTPUT_DIR, 'conversations')

def main():
    print("Starting data generation pipeline...")
    
    # --- Create Directories ---
    os.makedirs(CORE_QA_DIR, exist_ok=True)
    os.makedirs(TRANSACTIONS_DIR, exist_ok=True)
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)
    
    # --- Generate Transactions ---
    # A large set for training a future categorization model
    transactions_data = generate_transactions(5000)
    save_transactions_to_csv(transactions_data, os.path.join(TRANSACTIONS_DIR, 'categorized_transactions.csv'))
    
    # --- Generate Conversational Data ---
    # This will be used to test and fine-tune the agent's routing logic
    conversational_data = generate_conversations(2000)
    save_conversations_to_jsonl(conversational_data, os.path.join(CONVERSATIONS_DIR, 'successful_chats.jsonl'))
    
    # --- TODO: Generate other data files ---
    # Here you would add calls to generate_user_profiles, generate_core_qa, etc.
    # For now, we'll manually create the other files to keep it focused.
    
    print("Data generation pipeline finished.")

if __name__ == '__main__':
    main()