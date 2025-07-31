import csv
import random
from datetime import datetime, timedelta
from .config import fake, MERCHANTS_BY_CATEGORY

def generate_transactions(num_transactions):
    transactions = []
    for _ in range(num_transactions):
        category = random.choice(list(MERCHANTS_BY_CATEGORY.keys()))
        merchant = random.choice(MERCHANTS_BY_CATEGORY[category])
        amount = round(random.uniform(5.50, 250.99), 2)
        date = fake.date_time_between(start_date="-2y", end_date="now").isoformat()
        
        # Create a realistic description
        city = fake.city()
        state = fake.state_abbr()
        description = f"{merchant.upper()} {random.randint(100, 999)} {city} {state}"
        
        transactions.append({
            "transaction_id": fake.uuid4(),
            "description": description,
            "merchant": merchant,
            "amount": amount,
            "date": date,
            "category": category
        })
    return transactions

def save_transactions_to_csv(transactions, filepath):
    with open(filepath, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=transactions[0].keys())
        writer.writeheader()
        writer.writerows(transactions)
    print(f"Successfully generated {len(transactions)} transactions at {filepath}")