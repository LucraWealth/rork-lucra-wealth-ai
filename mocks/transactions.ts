// Define transaction types
export interface Transaction {
  id: string;
  type: "payment" | "send" | "receive" | "withdrawal" | "deposit" | "swap" | "buy" | "sell" | "cashback";
  title: string;
  amount: number;
  date: string;
  recipient?: string;
  description?: string;
  category?: string;
}

// Create a more comprehensive list of transactions with realistic data
export const transactions: Transaction[] = [
  // June 2023
  {
    id: "tx-20230615-1",
    type: "payment",
    title: "Netflix Subscription",
    amount: 15.49,
    date: "2023-06-15",
    description: "Monthly subscription",
    category: "Entertainment"
  },
  {
    id: "tx-20230614-1",
    type: "payment",
    title: "Uber Ride",
    amount: 22.00,
    date: "2023-06-14",
    description: "Airport trip",
    category: "Transportation"
  },
  {
    id: "tx-20230612-1",
    type: "payment",
    title: "Starbucks",
    amount: 6.30,
    date: "2023-06-12",
    description: "Coffee and pastry",
    category: "Food & Drink"
  },
  {
    id: "tx-20230610-1",
    type: "payment",
    title: "Spotify Premium",
    amount: 12.99,
    date: "2023-06-10",
    description: "Monthly subscription",
    category: "Entertainment"
  },
  {
    id: "tx-20230608-1",
    type: "payment",
    title: "Amazon Purchase",
    amount: 34.99,
    date: "2023-06-08",
    description: "Books and electronics",
    category: "Shopping"
  },
  {
    id: "tx-20230605-1",
    type: "send",
    title: "Sent to Sarah",
    amount: 50.00,
    date: "2023-06-05",
    recipient: "sarah@example.com",
    category: "Transfers"
  },
  {
    id: "tx-20230603-1",
    type: "receive",
    title: "Received from John",
    amount: 25.00,
    date: "2023-06-03",
    recipient: "john@example.com",
    category: "Transfers"
  },
  {
    id: "tx-20230601-1",
    type: "receive",
    title: "Salary Deposit",
    amount: 2500.00,
    date: "2023-06-01",
    recipient: "employer@company.com",
    category: "Income"
  },
  
  // May 2023
  {
    id: "tx-20230528-1",
    type: "withdrawal",
    title: "ATM Withdrawal",
    amount: 100.00,
    date: "2023-05-28",
    category: "Cash"
  },
  {
    id: "tx-20230525-1",
    type: "payment",
    title: "Electricity Bill",
    amount: 85.50,
    date: "2023-05-25",
    description: "Monthly utility bill",
    category: "Utilities"
  },
  {
    id: "tx-20230522-1",
    type: "payment",
    title: "Whole Foods",
    amount: 78.35,
    date: "2023-05-22",
    description: "Grocery shopping",
    category: "Food & Drink"
  },
  {
    id: "tx-20230520-1",
    type: "payment",
    title: "Trader Joe's",
    amount: 42.00,
    date: "2023-05-20",
    description: "Weekly groceries",
    category: "Food"
  },
  {
    id: "tx-20230518-1",
    type: "send",
    title: "Sent to Mike",
    amount: 75.00,
    date: "2023-05-18",
    recipient: "mike@example.com",
    category: "Transfers"
  },
  {
    id: "tx-20230515-1",
    type: "payment",
    title: "Internet Bill",
    amount: 65.00,
    date: "2023-05-15",
    description: "Monthly internet service",
    category: "Utilities"
  },
  {
    id: "tx-20230510-1",
    type: "payment",
    title: "Car Insurance",
    amount: 58.00,
    date: "2023-05-10",
    description: "Monthly premium",
    category: "Insurance"
  },
  {
    id: "tx-20230505-1",
    type: "payment",
    title: "Mobile Phone Bill",
    amount: 45.99,
    date: "2023-05-05",
    description: "Monthly phone service",
    category: "Utilities"
  },
  {
    id: "tx-20230501-1",
    type: "payment",
    title: "Gym Membership",
    amount: 29.99,
    date: "2023-05-01",
    description: "Monthly membership fee",
    category: "Health & Fitness"
  },
  
  // April 2023
  {
    id: "tx-20230428-1",
    type: "payment",
    title: "Cheesecake Factory",
    amount: 68.50,
    date: "2023-04-28",
    description: "Dinner with friends",
    category: "Food & Drink"
  },
  {
    id: "tx-20230425-1",
    type: "payment",
    title: "Shell Gas Station",
    amount: 45.75,
    date: "2023-04-25",
    description: "Fuel refill",
    category: "Transportation"
  },
  {
    id: "tx-20230420-1",
    type: "payment",
    title: "Water Bill",
    amount: 32.40,
    date: "2023-04-20",
    description: "Monthly utility bill",
    category: "Utilities"
  },
  {
    id: "tx-20230418-1",
    type: "payment",
    title: "Amazon Prime",
    amount: 14.99,
    date: "2023-04-18",
    description: "Annual subscription",
    category: "Shopping"
  },
  {
    id: "tx-20230415-1",
    type: "payment",
    title: "Uber Eats",
    amount: 28.50,
    date: "2023-04-15",
    description: "Food delivery",
    category: "Food & Drink"
  },
  {
    id: "tx-20230410-1",
    type: "payment",
    title: "Apple Music",
    amount: 9.99,
    date: "2023-04-10",
    description: "Monthly subscription",
    category: "Entertainment"
  },
  {
    id: "tx-20230405-1",
    type: "payment",
    title: "Supercuts",
    amount: 35.00,
    date: "2023-04-05",
    description: "Haircut",
    category: "Personal Care"
  },
  {
    id: "tx-20230401-1",
    type: "payment",
    title: "Parking Fee",
    amount: 12.00,
    date: "2023-04-01",
    description: "Downtown parking",
    category: "Transportation"
  },
  
  // March 2023
  {
    id: "tx-20230328-1",
    type: "payment",
    title: "AMC Theaters",
    amount: 24.00,
    date: "2023-03-28",
    description: "Movie tickets",
    category: "Entertainment"
  },
  {
    id: "tx-20230325-1",
    type: "payment",
    title: "Blue Bottle Coffee",
    amount: 8.75,
    date: "2023-03-25",
    description: "Morning coffee",
    category: "Food & Drink"
  },
  {
    id: "tx-20230320-1",
    type: "payment",
    title: "CVS Pharmacy",
    amount: 32.50,
    date: "2023-03-20",
    description: "Medications",
    category: "Health"
  },
  {
    id: "tx-20230315-1",
    type: "payment",
    title: "Zara",
    amount: 95.80,
    date: "2023-03-15",
    description: "Clothing purchase",
    category: "Shopping"
  },
  {
    id: "tx-20230310-1",
    type: "payment",
    title: "Home Depot",
    amount: 120.00,
    date: "2023-03-10",
    description: "Home improvement supplies",
    category: "Home"
  },
  {
    id: "tx-20230305-1",
    type: "payment",
    title: "Dentist Appointment",
    amount: 75.00,
    date: "2023-03-05",
    description: "Dental checkup",
    category: "Health"
  },
  {
    id: "tx-20230301-1",
    type: "payment",
    title: "Petco",
    amount: 45.30,
    date: "2023-03-01",
    description: "Pet supplies",
    category: "Pets"
  },
  
  // February 2023
  {
    id: "tx-20230225-1",
    type: "payment",
    title: "Barnes & Noble",
    amount: 28.95,
    date: "2023-02-25",
    description: "Books",
    category: "Entertainment"
  },
  {
    id: "tx-20230220-1",
    type: "payment",
    title: "Nike",
    amount: 150.00,
    date: "2023-02-20",
    description: "Running shoes",
    category: "Shopping"
  },
  {
    id: "tx-20230215-1",
    type: "payment",
    title: "Staples",
    amount: 42.75,
    date: "2023-02-15",
    description: "Office supplies",
    category: "Work"
  },
  {
    id: "tx-20230210-1",
    type: "payment",
    title: "Chipotle",
    amount: 15.75,
    date: "2023-02-10",
    description: "Lunch",
    category: "Food & Drink"
  },
  {
    id: "tx-20230205-1",
    type: "payment",
    title: "Spotify Family Plan",
    amount: 14.99,
    date: "2023-02-05",
    description: "Monthly subscription",
    category: "Entertainment"
  },
  {
    id: "tx-20230201-1",
    type: "payment",
    title: "Rent Payment",
    amount: 1800.00,
    date: "2023-02-01",
    description: "Monthly rent",
    category: "Housing"
  },
  
  // January 2023
  {
    id: "tx-20230125-1",
    type: "payment",
    title: "Target",
    amount: 87.50,
    date: "2023-01-25",
    description: "Household items",
    category: "Shopping"
  },
  {
    id: "tx-20230120-1",
    type: "payment",
    title: "Verizon Wireless",
    amount: 85.99,
    date: "2023-01-20",
    description: "Monthly phone bill",
    category: "Utilities"
  },
  {
    id: "tx-20230115-1",
    type: "payment",
    title: "Hulu",
    amount: 11.99,
    date: "2023-01-15",
    description: "Monthly subscription",
    category: "Entertainment"
  },
  {
    id: "tx-20230110-1",
    type: "payment",
    title: "Trader Joe's",
    amount: 65.45,
    date: "2023-01-10",
    description: "Grocery shopping",
    category: "Food"
  },
  {
    id: "tx-20230105-1",
    type: "payment",
    title: "January Rent",
    amount: 1800.00,
    date: "2023-01-05",
    description: "Monthly rent payment",
    category: "Housing"
  },
  {
    id: "tx-20230103-1",
    type: "payment",
    title: "Planet Fitness",
    amount: 10.00,
    date: "2023-01-03",
    description: "Monthly gym membership",
    category: "Health & Fitness"
  }
];