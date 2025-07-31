import json
import random
from .config import INTENT_TEMPLATES, ENTITIES, MERCHANTS_BY_CATEGORY

def generate_conversations(num_conversations):
    conversations = []
    for _ in range(num_conversations):
        intent = random.choice(list(INTENT_TEMPLATES.keys()))
        template = random.choice(INTENT_TEMPLATES[intent])
        
        # Fill entities in the template
        query = template
        if "{category}" in query:
            query = query.replace("{category}", random.choice(ENTITIES["category"]))
        if "{timeframe}" in query:
            query = query.replace("{timeframe}", random.choice(ENTITIES["timeframe"]))
        if "{merchant}" in query:
            all_merchants = [m for sublist in MERCHANTS_BY_CATEGORY.values() for m in sublist]
            query = query.replace("{merchant}", random.choice(all_merchants))
        if "{amount}" in query:
            query = query.replace("{amount}", str(random.randint(500, 5000)))
        if "{purpose}" in query:
            query = query.replace("{purpose}", random.choice(ENTITIES["purpose"]))
        if "{duration}" in query:
            query = query.replace("{duration}", random.choice(ENTITIES["duration"]))
            
        conversations.append({"intent": intent, "user_query": query})
    return conversations

def save_conversations_to_jsonl(conversations, filepath):
    with open(filepath, 'w') as f:
        for conv in conversations:
            f.write(json.dumps(conv) + '\n')
    print(f"Successfully generated {len(conversations)} conversations at {filepath}")