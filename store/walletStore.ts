import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { transactions } from "@/mocks/transactions";
import { Token } from "@/mocks/tokens";
import { bills as initialBills } from "@/mocks/bills";

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

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  icon: string;
  transactionCategory?: string;
}

export interface BillHistory {
  date: string;
  amount: number;
  status: string;
  transactionId?: string;
}

export interface AutoPaySettings {
  enabled: boolean;
  paymentMethod: string;
  paymentDate: number; // Day of month (1-31)
  nextPaymentDate?: string;
  nextPaymentDateRaw?: string; // Add this line
  lastPaymentDate?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  description?: string;
  isPaid: boolean;
  isOverdue: boolean;
  logoUrl?: string;
  billNumber?: string;
  accountNumber?: string;
  billingPeriod?: string;
  paymentMethod?: string;
  history?: BillHistory[];
  autoPay?: AutoPaySettings;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  tokens: Token[];
  cashback: number;
  stakingPositions: StakingPosition[];
  contacts: Contact[];
  bills: Bill[];
  budgetCategories: BudgetCategory[];
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateBalance: (amount: number) => void;
  addCashback: (amount: number) => void;
  withdrawCashback: () => void;
  swapTokens: (fromSymbol: string, toSymbol: string, amount: number) => void;
  buyToken: (symbol: string, amount: number, price: number) => void;
  sellToken: (symbol: string, amount: number, price: number) => void;
  addStakingPosition: (position: StakingPosition) => void;
  removeStakingPosition: (id: string) => void;
  updateStakingPosition: (id: string, amount: number) => void;
  
  // Budget actions
  setBudgetLimit: (categoryId: string, limit: number) => void;
  addBudgetCategory: (category: Omit<BudgetCategory, "id" | "spent">) => void;
  removeBudgetCategory: (categoryId: string) => void;
  updateBudgetSpending: () => void;
  
  // Auto Pay actions
  toggleAutoPay: (billId: string) => void;
  updateAutoPaySettings: (billId: string, settings: Partial<AutoPaySettings>) => void;
  
  // Added missing functions
  addContact: (contact: Omit<Contact, "id">) => void;
  updateBillStatus: (billId: string, isPaid: boolean) => void;
  addBill: (bill: Omit<Bill, "id" | "isPaid" | "isOverdue">) => void;
  payBill: (billId: string, amount: number, category: string) => void;
  sendMoney: (recipient: string, amount: number, description?: string) => void;
  redeemCashback: (amount: number, method: string) => void;
  depositMoney: (amount: number, description?: string) => void;
  refreshBills: () => Promise<void>;
  getBillPaymentHistory: (billId: string) => BillHistory[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getTransactionsByCategory: (category: string, startDate?: string, endDate?: string) => Transaction[];
  error: string | null;
  clearError: () => void;
}

export interface StakingPosition {
  id: string;
  tokenSymbol: string;
  amount: number;
  apy: number;
  startDate: Date;
  endDate?: Date;
  rewards: number;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  handle?: string;
  avatar?: string;
}

// Ensure bills from mocks have the isOverdue property
const processedBills = initialBills.map(bill => ({
  ...bill,
  isOverdue: bill.isOverdue || false
}));

// Default budget categories with correct transaction category mappings
const defaultBudgetCategories: BudgetCategory[] = [
  {
    id: "utilities",
    name: "Utilities",
    limit: 200,
    spent: 0,
    color: "#4A8FE7",
    icon: "Zap",
    transactionCategory: "Utilities"
  },
  {
    id: "food",
    name: "Food & Dining",
    limit: 400,
    spent: 0,
    color: "#FF6B6B",
    icon: "Coffee",
    transactionCategory: "Food & Drink"
  },
  {
    id: "entertainment",
    name: "Entertainment",
    limit: 150,
    spent: 0,
    color: "#9B59B6",
    icon: "Music",
    transactionCategory: "Entertainment"
  },
  {
    id: "transportation",
    name: "Transportation",
    limit: 300,
    spent: 0,
    color: "#F39C12",
    icon: "Car",
    transactionCategory: "Transportation"
  },
  {
    id: "shopping",
    name: "Shopping",
    limit: 250,
    spent: 0,
    color: "#E74C3C",
    icon: "ShoppingBag",
    transactionCategory: "Shopping"
  },
  {
    id: "health",
    name: "Health & Fitness",
    limit: 100,
    spent: 0,
    color: "#2ECC71",
    icon: "Heart",
    transactionCategory: "Health & Fitness"
  }
];

export const useWalletStore = create<WalletState>()(
  persist<WalletState>(
    (set, get) => ({
      balance: 1160.76,
      transactions: transactions || [],
      tokens: [
        {
          id: "btc",
          name: "Bitcoin",
          symbol: "BTC",
          balance: 0.05,
          price: 60000,
          change: 2.5,
          iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025",
          color: "#F7931A",
        },
        {
          id: "eth",
          name: "Ethereum",
          symbol: "ETH",
          balance: 0.75,
          price: 2800,
          change: -1.2,
          iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025",
          color: "#627EEA",
        },
        {
          id: "sol",
          name: "Solana",
          symbol: "SOL",
          balance: 10,
          price: 120,
          change: 5.8,
          iconUrl: "https://cryptologos.cc/logos/solana-sol-logo.png?v=025",
          color: "#14F195",
        },
        {
          id: "usdc",
          name: "USD Coin",
          symbol: "USDC",
          balance: 500,
          price: 1,
          change: 0,
          iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
          color: "#2775CA",
        },
        // {
        //   id: "lcra",
        //   name: "Lucra",
        //   symbol: "LCRA",
        //   balance: 1000,
        //   price: 0.03,
        //   change: 10.5,
        //   iconUrl: "https://cdn-icons-png.flaticon.com/512/6404/6404078.png",
        //   color: "#4AE3A8",
        // },
      ],
      cashback: 30,
      stakingPositions: [
        // {
        //   id: "staking-1",
        //   tokenSymbol: "LCRA",
        //   amount: 100,
        //   apy: 12,
        //   startDate: new Date("2023-01-01"),
        //   rewards: 3.5,
        // },
        {
          id: "staking-2",
          tokenSymbol: "ETH",
          amount: 0.1,
          apy: 5,
          startDate: new Date("2023-02-15"),
          rewards: 0.0015,
        },
      ],
      contacts: [
        {
          id: "contact-1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1 (555) 123-4567",
          avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random&color=fff&size=128"
        },
        {
          id: "contact-2",
          name: "John Smith",
          email: "john@example.com",
          phone: "+1 (555) 987-6543",
          avatar: "https://ui-avatars.com/api/?name=John+Smith&background=random&color=fff&size=128"
        },
        {
          id: "contact-3",
          name: "Mike Wilson",
          email: "mike@example.com",
          phone: "+1 (555) 456-7890",
          avatar: "https://ui-avatars.com/api/?name=Mike+Wilson&background=random&color=fff&size=128"
        }
      ],
      bills: processedBills || [],
      budgetCategories: defaultBudgetCategories,
      error: null,
      
      addTransaction: (transaction) =>
        set((state) => {
          const newState = {
            transactions: [transaction, ...state.transactions],
          };
          
          // Update budget spending when a new transaction is added
          setTimeout(() => {
            get().updateBudgetSpending();
          }, 0);
          
          return newState;
        }),
        
      updateBalance: (amount) =>
        set((state) => ({
          balance: state.balance + amount,
        })),
        
      addCashback: (amount) =>
        set((state) => ({
          cashback: state.cashback + amount,
        })),
        
      withdrawCashback: () =>
        set((state) => {
          // Create a transaction for the cashback withdrawal
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: "cashback",
            title: "Cashback Redemption",
            amount: state.cashback,
            date: new Date().toISOString(),
            category: "Rewards",
          };
          
          return {
            cashback: 0,
            balance: state.balance + state.cashback,
            transactions: [transaction, ...state.transactions],
          };
        }),
        
      swapTokens: (fromSymbol, toSymbol, amount) =>
        set((state) => {
          const fromToken = state.tokens.find((t) => t.symbol === fromSymbol);
          const toToken = state.tokens.find((t) => t.symbol === toSymbol);
          
          if (!fromToken || !toToken) return state;
          
          const exchangeRate = fromToken.price / toToken.price;
          const toAmount = amount * exchangeRate;
          
          const updatedTokens = state.tokens.map((token) => {
            if (token.symbol === fromSymbol) {
              return { ...token, balance: token.balance - amount };
            }
            if (token.symbol === toSymbol) {
              return { ...token, balance: token.balance + toAmount };
            }
            return token;
          });
          
          return { tokens: updatedTokens };
        }),
        
      buyToken: (symbol, amount, price) =>
        set((state) => {
          const token = state.tokens.find((t) => t.symbol === symbol);
          if (!token) return state;
          
          const cost = amount * price;
          
          const updatedTokens = state.tokens.map((t) => {
            if (t.symbol === symbol) {
              return { ...t, balance: t.balance + amount };
            }
            return t;
          });
          
          return {
            tokens: updatedTokens,
            balance: state.balance - cost,
          };
        }),
        
      sellToken: (symbol, amount, price) =>
        set((state) => {
          const token = state.tokens.find((t) => t.symbol === symbol);
          if (!token) return state;
          
          const value = amount * price;
          
          const updatedTokens = state.tokens.map((t) => {
            if (t.symbol === symbol) {
              return { ...t, balance: t.balance - amount };
            }
            return t;
          });
          
          return {
            tokens: updatedTokens,
            balance: state.balance + value,
          };
        }),
        
      addStakingPosition: (position) =>
        set((state) => ({
          stakingPositions: [...state.stakingPositions, position],
          tokens: state.tokens.map((token) => {
            if (token.symbol === position.tokenSymbol) {
              return { ...token, balance: token.balance - position.amount };
            }
            return token;
          }),
        })),
        
      removeStakingPosition: (id) =>
        set((state) => {
          const position = state.stakingPositions.find((p) => p.id === id);
          if (!position) return state;
          
          return {
            stakingPositions: state.stakingPositions.filter((p) => p.id !== id),
            tokens: state.tokens.map((token) => {
              if (token.symbol === position.tokenSymbol) {
                return {
                  ...token,
                  balance: token.balance + position.amount + position.rewards,
                };
              }
              return token;
            }),
          };
        }),
        
      updateStakingPosition: (id, amount) =>
        set((state) => {
          const position = state.stakingPositions.find((p) => p.id === id);
          if (!position) return state;
          
          const amountDiff = amount - position.amount;
          
          return {
            stakingPositions: state.stakingPositions.map((p) => {
              if (p.id === id) {
                return { ...p, amount };
              }
              return p;
            }),
            tokens: state.tokens.map((token) => {
              if (token.symbol === position.tokenSymbol) {
                return {
                  ...token,
                  balance: token.balance - amountDiff,
                };
              }
              return token;
            }),
          };
        }),

      // Budget actions
      setBudgetLimit: (categoryId, limit) =>
        set((state) => ({
          budgetCategories: state.budgetCategories.map(category =>
            category.id === categoryId
              ? { ...category, limit }
              : category
          )
        })),

      addBudgetCategory: (category) =>
        set((state) => {
          const newCategory = {
            id: `budget-${Date.now()}`,
            spent: 0,
            ...category
          };
          
          const newState = {
            budgetCategories: [...state.budgetCategories, newCategory]
          };
          
          // Update budget spending for the new category
          setTimeout(() => {
            get().updateBudgetSpending();
          }, 0);
          
          return newState;
        }),

      removeBudgetCategory: (categoryId) =>
        set((state) => ({
          budgetCategories: state.budgetCategories.filter(category => category.id !== categoryId)
        })),

      updateBudgetSpending: () =>
        set((state) => {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          // Calculate spending for each category this month
          const updatedCategories = state.budgetCategories.map(category => {
            const categorySpending = state.transactions
              .filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                                     transactionDate.getFullYear() === currentYear;
                const isExpense = transaction.type === "payment" || 
                                transaction.type === "send" || 
                                transaction.type === "withdrawal";
                
                // Enhanced category matching
                let matchesCategory = false;
                if (transaction.category && category.transactionCategory) {
                  const transactionCategory = transaction.category.toLowerCase().trim();
                  const mappedCategory = category.transactionCategory.toLowerCase().trim();
                  
                  // Direct exact match
                  if (transactionCategory === mappedCategory) {
                    matchesCategory = true;
                  } else {
                    // Normalize strings for better matching
                    const normalizeString = (str: string) => 
                      str.replace(/[&\s\-_]+/g, '').toLowerCase();
                    
                    const normalizedTransaction = normalizeString(transactionCategory);
                    const normalizedMapped = normalizeString(mappedCategory);
                    
                    // Check if either contains the other
                    if (normalizedTransaction.includes(normalizedMapped) || 
                        normalizedMapped.includes(normalizedTransaction)) {
                      matchesCategory = true;
                    } else {
                      // Additional flexible matching for common variations
                      const flexibleMatches = [
                        // Food variations
                        { patterns: ['food', 'dining', 'drink', 'restaurant', 'grocery'], category: 'food' },
                        // Utilities variations
                        { patterns: ['utilities', 'electric', 'water', 'gas', 'internet', 'phone', 'mobile'], category: 'utilities' },
                        // Entertainment variations
                        { patterns: ['entertainment', 'movie', 'music', 'streaming', 'netflix', 'spotify', 'hulu'], category: 'entertainment' },
                        // Transportation variations
                        { patterns: ['transportation', 'uber', 'gas', 'parking', 'fuel'], category: 'transportation' },
                        // Shopping variations
                        { patterns: ['shopping', 'amazon', 'store', 'retail'], category: 'shopping' },
                        // Health variations
                        { patterns: ['health', 'fitness', 'medical', 'gym', 'doctor'], category: 'health' }
                      ];
                      
                      for (const match of flexibleMatches) {
                        const categoryMatches = match.patterns.some(pattern => 
                          normalizedTransaction.includes(pattern) || normalizedMapped.includes(pattern)
                        );
                        
                        if (categoryMatches && (
                          category.id.includes(match.category) || 
                          normalizedMapped.includes(match.category)
                        )) {
                          matchesCategory = true;
                          break;
                        }
                      }
                    }
                  }
                }
                
                return isCurrentMonth && isExpense && matchesCategory;
              })
              .reduce((total, transaction) => total + transaction.amount, 0);
            
            return {
              ...category,
              spent: categorySpending
            };
          });
          
          return {
            budgetCategories: updatedCategories
          };
        }),

      // Auto Pay actions
      toggleAutoPay: (billId) =>
        set((state) => {
          const updatedBills = state.bills.map(bill => {
            if (bill.id === billId) {
              const newEnabled = !(bill.autoPay?.enabled ?? false);
              
              // Calculate next payment date if enabling
              let nextPaymentDate: string | undefined;
              let nextPaymentDateRaw: string | undefined;
              
              if (newEnabled) {
                const today = new Date();
                const paymentDate = bill.autoPay?.paymentDate || 15;
                let nextMonth = new Date(today.getFullYear(), today.getMonth(), paymentDate);
                
                // If the payment date has already passed this month, schedule for next month
                if (paymentDate <= today.getDate()) {
                  nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDate);
                }
                
                nextPaymentDate = nextMonth.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                nextPaymentDateRaw = nextMonth.toISOString();
              }
              
              return {
                ...bill,
                autoPay: {
                  enabled: newEnabled,
                  paymentMethod: bill.autoPay?.paymentMethod || bill.paymentMethod || "Visa •••• 4242",
                  paymentDate: bill.autoPay?.paymentDate || 15,
                  nextPaymentDate: newEnabled ? nextPaymentDate : undefined,
                  nextPaymentDateRaw: newEnabled ? nextPaymentDateRaw : undefined,
                  lastPaymentDate: bill.autoPay?.lastPaymentDate,
                }
              };
            }
            return bill;
          });
          
          return { bills: updatedBills };
        }),

      updateAutoPaySettings: (billId, settings) =>
        set((state) => ({
          bills: state.bills.map(bill =>
            bill.id === billId
              ? {
                  ...bill,
                  autoPay: {
                    enabled: bill.autoPay?.enabled ?? false,
                    paymentMethod: settings.paymentMethod || bill.autoPay?.paymentMethod || "Visa •••• 4242",
                    paymentDate: settings.paymentDate || bill.autoPay?.paymentDate || 15,
                    nextPaymentDate: settings.nextPaymentDate || bill.autoPay?.nextPaymentDate,
                    nextPaymentDateRaw: settings.nextPaymentDateRaw || bill.autoPay?.nextPaymentDateRaw,
                    lastPaymentDate: settings.lastPaymentDate || bill.autoPay?.lastPaymentDate,
                  }
                }
              : bill
          )
        })),

      // Added missing functions
      addContact: (contact) => 
        set((state) => ({
          contacts: [
            ...state.contacts,
            {
              id: `contact-${Date.now()}`,
              ...contact
            }
          ]
        })),

      updateBillStatus: (billId, isPaid) =>
        set((state) => ({
          bills: state.bills.map(bill => 
            bill.id === billId 
              ? { ...bill, isPaid } 
              : bill
          )
        })),

      addBill: (bill) =>
        set((state) => ({
          bills: [
            ...state.bills,
            {
              id: `bill-${Date.now()}`,
              isPaid: false,
              isOverdue: false,
              ...bill
            }
          ]
        })),

      payBill: (billId, amount, category) =>
        set((state) => {
          // Find the bill
          const bill = state.bills.find(b => b.id === billId);
          if (!bill) return { error: "Bill not found" };
          
          // Create a transaction for the bill payment
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: "payment",
            title: bill.name,
            amount: amount,
            date: new Date().toISOString(),
            category: category,
            recipient: bill.name,
          };

          // Add cashback (5% of the bill amount)
          const cashbackAmount = amount * 0.05;

          // Create payment history entry
          const historyEntry: BillHistory = {
            date: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            amount: amount,
            status: "Paid",
            transactionId: transaction.id
          };

          // Update bill status to paid and add to history
          const updatedBills = state.bills.map(b => 
            b.id === billId 
              ? { 
                  ...b, 
                  isPaid: true,
                  history: [historyEntry, ...(b.history || [])]
                } 
              : b
          );

          const newState = {
            balance: state.balance - amount,
            cashback: state.cashback + cashbackAmount,
            transactions: [transaction, ...state.transactions],
            bills: updatedBills,
            error: null,
          };

          // Update budget spending
          setTimeout(() => {
            get().updateBudgetSpending();
          }, 0);

          return newState;
        }),

      sendMoney: (recipient, amount, description) =>
        set((state) => {
          if (amount > state.balance) {
            return { error: "Insufficient funds" };
          }

          // Create a transaction for the money transfer
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: "send",
            title: description || "Money transfer",
            amount: amount,
            date: new Date().toISOString(),
            recipient: recipient,
          };

          const newState = {
            balance: state.balance - amount,
            transactions: [transaction, ...state.transactions],
            error: null,
          };

          // Update budget spending
          setTimeout(() => {
            get().updateBudgetSpending();
          }, 0);

          return newState;
        }),

      redeemCashback: (amount, method) =>
        set((state) => {
          if (amount > state.cashback) {
            return { error: "Insufficient cashback balance" };
          }

          let transaction: Transaction;
          let tokenAmount = 0;

          if (method === "wallet") {
            transaction = {
              id: `tx-${Date.now()}`,
              type: "cashback",
              title: "Cashback Redemption",
              amount: amount,
              date: new Date().toISOString(),
              category: "Rewards",
            };

            return {
              cashback: state.cashback - amount,
              balance: state.balance + amount,
              transactions: [transaction, ...state.transactions],
              error: null,
            };
          } else if (method === "token") {
            // Find LCRA token price
            const lcraToken = state.tokens.find(t => t.symbol === "LCRA");
            const lcraPrice = lcraToken?.price || 0.03; // Default to 0.03 if not found
            
            // Convert to LCRA tokens with 5% bonus
            tokenAmount = amount * 1.05 / lcraPrice;

            transaction = {
              id: `tx-${Date.now()}`,
              type: "cashback",
              title: "Cashback to LCRA",
              amount: amount,
              date: new Date().toISOString(),
              category: "Rewards",
            };

            const updatedTokens = state.tokens.map((token) => {
              if (token.symbol === "LCRA") {
                return { ...token, balance: token.balance + tokenAmount };
              }
              return token;
            });

            return {
              cashback: state.cashback - amount,
              tokens: updatedTokens,
              transactions: [transaction, ...state.transactions],
              error: null,
            };
          } else if (method === "bank") {
            transaction = {
              id: `tx-${Date.now()}`,
              type: "cashback",
              title: "Cashback to Bank",
              amount: amount,
              date: new Date().toISOString(),
              category: "Rewards",
            };

            return {
              cashback: state.cashback - amount,
              transactions: [transaction, ...state.transactions],
              error: null,
            };
          }

          return state;
        }),

      depositMoney: (amount, description) => 
        set((state) => {
          if (amount <= 0) {
            return { error: "Amount must be greater than zero" };
          }

          // Create a transaction for the deposit
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: "deposit",
            title: description || "Money deposit",
            amount: amount,
            date: new Date().toISOString(),
            category: "Deposit",
          };

          return {
            balance: state.balance + amount,
            transactions: [transaction, ...state.transactions],
            error: null,
          };
        }),

      refreshBills: async () => {
        // Simulate API call to refresh bills data
        return new Promise((resolve) => {
          setTimeout(() => {
            // In a real app, this would fetch fresh data from the server
            // For now, we'll just trigger a re-render by updating the bills array
            set((state) => ({
              bills: [...state.bills] // Create a new array reference to trigger re-render
            }));
            resolve();
          }, 1000);
        });
      },

      getBillPaymentHistory: (billId) => {
        const state = get();
        const bill = state.bills.find(b => b.id === billId);
        
        if (!bill) return [];
        
        // Get payment history from bill's history and also from transactions
        const billHistory = bill.history || [];
        
        // Also get transactions that match this bill
        const billTransactions = state.transactions
          .filter(t => 
            t.type === "payment" && 
            (t.title === bill.name || t.recipient === bill.name)
          )
          .map(t => ({
            date: new Date(t.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            amount: t.amount,
            status: "Paid",
            transactionId: t.id
          }));
        
        // Combine and deduplicate
        const allHistory = [...billHistory];
        
        // Add transaction history that's not already in bill history
        billTransactions.forEach(txHistory => {
          const exists = billHistory.some(h => h.transactionId === txHistory.transactionId);
          if (!exists) {
            allHistory.push(txHistory);
          }
        });
        
        // Sort by date (newest first)
        return allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        const state = get();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return state.transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= start && transactionDate <= end;
        });
      },

      getTransactionsByCategory: (category, startDate, endDate) => {
        const state = get();
        let filteredTransactions = state.transactions;
        
        // Filter by date range if provided
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= start && transactionDate <= end;
          });
        }
        
        // Filter by category
        return filteredTransactions.filter(transaction => {
          if (!transaction.category) return false;
          
          const transactionCategory = transaction.category.toLowerCase().trim();
          const targetCategory = category.toLowerCase().trim();
          
          // Direct match
          if (transactionCategory === targetCategory) return true;
          
          // Normalize and check for partial matches
          const normalizeString = (str: string) => 
            str.replace(/[&\s\-_]+/g, '').toLowerCase();
          
          const normalizedTransaction = normalizeString(transactionCategory);
          const normalizedTarget = normalizeString(targetCategory);
          
          return normalizedTransaction.includes(normalizedTarget) || 
                 normalizedTarget.includes(normalizedTransaction);
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "wallet-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Calculate budget spending when store is rehydrated
        if (state) {
          setTimeout(() => {
            state.updateBudgetSpending();
          }, 100);
        }
      },
    }
  )
);