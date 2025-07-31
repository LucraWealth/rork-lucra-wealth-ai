# Configuration for the data generation pipeline
from faker import Faker

fake = Faker()

# --- Merchants & Categories ---
MERCHANTS_BY_CATEGORY = {
    "groceries": ["Whole Foods", "Trader Joe's", "Safeway", "Instacart", "Kroger"],
    "dining": ["Starbucks", "McDonald's", "Doordash", "Subway", "Sweetgreen", "Chipotle"],
    "transportation": ["Uber", "Lyft", "Clipper Card", "Chevron", "Shell Gas"],
    "shopping": ["Amazon.com", "Target", "Walmart", "Best Buy", "Etsy", "Zara"],
    "entertainment": ["Netflix.com", "Spotify", "AMC Theatres", "Ticketmaster", "Steam Games"],
    "utilities": ["PG&E", "Comcast", "Verizon", "AT&T", "T-Mobile"],
    "health & wellness": ["CVS Pharmacy", "Walgreens", "24 Hour Fitness", "Good-RX"],
    "travel": ["Expedia", "Airbnb", "United Airlines", "Delta", "Marriott Hotels"],
    "bills": ["Geico", "State Farm", "Sallie Mae", "SoFi Student Loan"],
}

# --- Conversational Templates ---
INTENT_TEMPLATES = {
    "check_balance": [
        "What's my balance?", "How much money do I have?", "Show me my account balance.",
        "What's in my checking account?", "How much do I have left?", "current balance please",
    ],
    "spending_analysis": [
        "How much did I spend on {category} this {timeframe}?",
        "Show my {category} spending for {timeframe}",
        "What did I spend at {merchant} last {timeframe}?",
        "Give me a breakdown of my {category} expenses for the {timeframe}",
    ],
    "savings_goal_creation": [
        "I want to save ${amount} for a {purpose}",
        "Help me create a savings goal for ${amount}",
        "Set up a ${purpose} fund of ${amount} over {duration}",
    ],
}

ENTITIES = {
    "category": list(MERCHANTS_BY_CATEGORY.keys()),
    "timeframe": ["week", "month", "year"],
    "purpose": ["vacation", "new car", "down payment", "emergency fund", "new laptop"],
    "duration": ["6 months", "1 year", "2 years"],
}

# --- User Profile Archetypes ---
USER_PROFILES = [
    {
        "user_type": "student", "monthly_income_range": (1000, 2500),
        "spending_focus": ["dining", "entertainment", "transportation"],
        "common_questions": ["How can I stop overspending on food?", "How does Smart Save work?", "Can I get a small cash advance?"],
    },
    {
        "user_type": "young_professional", "monthly_income_range": (4500, 8000),
        "spending_focus": ["dining", "shopping", "travel", "housing"],
        "common_questions": ["How can I save for a down payment?", "What is my biggest spending category?", "How can I optimize my savings?"],
    },
    {
        "user_type": "family_household", "monthly_income_range": (7000, 15000),
        "spending_focus": ["groceries", "utilities", "bills", "health & wellness"],
        "common_questions": ["How can we reduce our grocery bill?", "Are we saving enough for the future?", "Track my spending on bills this month."],
    },
]