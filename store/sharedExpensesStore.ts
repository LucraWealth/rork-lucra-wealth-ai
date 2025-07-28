import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Contact } from "@/store/walletStore";

export interface SharedExpense {
  id: string;
  title: string;
  totalAmount: number;
  paidBy: string; // Contact ID
  createdAt: string;
  category: string;
  description?: string;
  splits: ExpenseSplit[];
  isSettled: boolean;
}

export interface ExpenseSplit {
  contactId: string;
  amount: number;
  percentage: number;
  isSettled: boolean;
  settledAt?: string;
}

export interface ContactBalance {
  contactId: string;
  totalOwed: number; // Amount you owe them
  totalOwedToYou: number; // Amount they owe you
  netBalance: number; // Positive = they owe you, Negative = you owe them
  expenses: SharedExpense[];
}

export type SplitType = 
  | "paid_by_you_split_equally"
  | "paid_by_you_they_owe_full"
  | "paid_by_you_custom_split"
  | "paid_by_them_split_equally"
  | "paid_by_them_you_owe_full";

interface SharedExpensesState {
  expenses: SharedExpense[];
  reminders: { [contactId: string]: string }; // contactId -> last reminder date
  
  // Actions
  addExpense: (expense: Omit<SharedExpense, "id" | "createdAt" | "isSettled">) => void;
  settleExpense: (expenseId: string, contactId: string) => void;
  settleAllWithContact: (contactId: string) => void;
  getContactBalances: () => ContactBalance[];
  getContactBalance: (contactId: string) => ContactBalance | null;
  getExpensesByContact: (contactId: string) => SharedExpense[];
  deleteExpense: (expenseId: string) => void;
  updateExpense: (expenseId: string, updates: Partial<SharedExpense>) => void;
  sendReminder: (contactId: string) => void;
  getLastReminderDate: (contactId: string) => string | null;
}

// Fixed helper function to calculate splits
export const calculateSplits = (
  splitType: SplitType,
  totalAmount: number,
  participants: Contact[],
  paidBy: string,
  customSplits?: { contactId: string; percentage: number }[]
): ExpenseSplit[] => {
  const currentUserId = "current-user";
  const splits: ExpenseSplit[] = [];
  
  // Filter out current user for paid-by-you scenarios
  const validParticipants = participants.filter(
    contact => contact.id !== currentUserId
  );

  switch (splitType) {
    case "paid_by_you_split_equally":
      // Include payer in total people count but exclude from splits
      const totalPeople = validParticipants.length + 1;
      const equalAmount = totalAmount / totalPeople;
      
      validParticipants.forEach(contact => {
        splits.push({
          contactId: contact.id,
          amount: equalAmount,
          percentage: 100 / totalPeople,
          isSettled: false
        });
      });
      break;
      
    case "paid_by_you_they_owe_full":
      // Only non-payers should be in splits
      const amountPerPerson = totalAmount / validParticipants.length;
      validParticipants.forEach(contact => {
        splits.push({
          contactId: contact.id,
          amount: amountPerPerson,
          percentage: 100 / validParticipants.length,
          isSettled: false
        });
      });
      break;
      
    case "paid_by_you_custom_split":
      if (!customSplits) break;
      customSplits.forEach(split => {
        // Exclude current user from custom splits
        if (split.contactId !== currentUserId) {
          splits.push({
            contactId: split.contactId,
            amount: (totalAmount * split.percentage) / 100,
            percentage: split.percentage,
            isSettled: false
          });
        }
      });
      break;
      
    case "paid_by_them_split_equally":
      // Someone else paid, split equally among all participants
      const totalPeopleThem = validParticipants.length + 1;
      const equalAmountThem = totalAmount / totalPeopleThem;
      
      // Current user owes their share
      splits.push({
        contactId: currentUserId,
        amount: equalAmountThem,
        percentage: 100 / totalPeopleThem,
        isSettled: false
      });
      break;
      
    case "paid_by_them_you_owe_full":
      // Someone else paid, current user owes the full amount
      splits.push({
        contactId: currentUserId,
        amount: totalAmount,
        percentage: 100,
        isSettled: false
      });
      break;
      
    default:
      break;
  }
  
  return splits;
};

export const useSharedExpensesStore = create<SharedExpensesState>()(
  persist(
    (set, get) => ({
      expenses: [],
      reminders: {},
      
      addExpense: (expense) =>
      set((state) => {
        const newExpense = {
          id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          isSettled: false,
          ...expense
        };
        
        // Enhanced duplicate detection that considers the splits array
        const duplicateExists = state.expenses.some(existing => {
          // Basic field matches
          const basicMatch = existing.title === newExpense.title &&
            existing.totalAmount === newExpense.totalAmount &&
            existing.paidBy === newExpense.paidBy &&
            Math.abs(new Date(existing.createdAt).getTime() - new Date(newExpense.createdAt).getTime()) < 5000; // Within 5 seconds
          
          if (!basicMatch) return false;
          
          // Check if splits are identical (same participants and amounts)
          const existingSplits = existing.splits.sort((a, b) => a.contactId.localeCompare(b.contactId));
          const newSplits = newExpense.splits.sort((a, b) => a.contactId.localeCompare(b.contactId));
          
          if (existingSplits.length !== newSplits.length) return false;
          
          const splitsMatch = existingSplits.every((split, index) => {
            const newSplit = newSplits[index];
            return split.contactId === newSplit.contactId &&
              Math.abs(split.amount - newSplit.amount) < 0.01 && // Allow for small floating point differences
              Math.abs(split.percentage - newSplit.percentage) < 0.01;
          });
          
          return splitsMatch;
        });
        
        
        if (duplicateExists) {
          console.warn('Duplicate expense detected, not adding:', newExpense.title);
          return state; // Don't add duplicate
        }
        
        return {
          expenses: [newExpense, ...state.expenses]
        };
      }),
        
      settleExpense: (expenseId, contactId) =>
        set((state) => ({
          expenses: state.expenses.map(expense => {
            if (expense.id === expenseId) {
              const updatedSplits = expense.splits.map(split => 
                split.contactId === contactId
                  ? { ...split, isSettled: true, settledAt: new Date().toISOString() }
                  : split
              );
              
              const allSettled = updatedSplits.every(split => split.isSettled);
              
              
              return {
                ...expense,
                splits: updatedSplits,
                isSettled: allSettled
              };
            }
            return expense;
          })
        })),
        
      settleAllWithContact: (contactId) =>
        set((state) => {
          const currentUserId = "current-user";
          
          return {
            expenses: state.expenses.map(expense => {
              // Find splits involving this contact
              const hasContactSplit = expense.splits.some(split => 
                split.contactId === contactId || 
                (split.contactId === currentUserId && expense.paidBy === contactId)
              );
              
              if (hasContactSplit) {
                const updatedSplits = expense.splits.map(split => {
                  if (split.contactId === contactId || 
                      (split.contactId === currentUserId && expense.paidBy === contactId)) {
                    return { ...split, isSettled: true, settledAt: new Date().toISOString() };
                  }
                  return split;
                });
                
                const allSettled = updatedSplits.every(split => split.isSettled);
                
                return {
                  ...expense,
                  splits: updatedSplits,
                  isSettled: allSettled
                };
              }
              
              return expense;
            })
          };
        }),
        
      // FIXED: Corrected the getContactBalances function
      getContactBalances: () => {
        const state = get();
        const currentUserId = "current-user";
        const balances = new Map<string, ContactBalance>();
        
        state.expenses.forEach(expense => {
          const currentUserPaid = expense.paidBy === currentUserId;
          
          if (currentUserPaid) {
            // Current user paid - process each split (other people owe current user)
            expense.splits.forEach(split => {
              if (split.contactId !== currentUserId) {
                // Initialize balance for the contact if not exists
                if (!balances.has(split.contactId)) {
                  balances.set(split.contactId, {
                    contactId: split.contactId,
                    totalOwed: 0,
                    totalOwedToYou: 0,
                    netBalance: 0,
                    expenses: []
                  });
                }
                
                const balance = balances.get(split.contactId)!;
                
                // Add this expense to the contact's expense list (avoid duplicates)
                if (!balance.expenses.some(e => e.id === expense.id)) {
                  balance.expenses.push(expense);
                }
                
                // Contact owes money to current user
                if (!split.isSettled) {
                  balance.totalOwedToYou += split.amount;
                }
              }
            });
          } else {
            // Someone else paid - check if current user has a split
            const currentUserSplit = expense.splits.find(split => split.contactId === currentUserId);
            if (currentUserSplit) {
              const payerId = expense.paidBy;
              
              // Initialize balance for the payer if not exists
              if (!balances.has(payerId)) {
                balances.set(payerId, {
                  contactId: payerId,
                  totalOwed: 0,
                  totalOwedToYou: 0,
                  netBalance: 0,
                  expenses: []
                });
              }
              
              const balance = balances.get(payerId)!;
              
              // Add this expense to the contact's expense list (avoid duplicates)
              if (!balance.expenses.some(e => e.id === expense.id)) {
                balance.expenses.push(expense);
              }
              
              // Current user owes money to the payer
              if (!currentUserSplit.isSettled) {
                balance.totalOwed += currentUserSplit.amount;
              }
            }
          }
        });
        
        // Calculate net balances and return only contacts with non-zero balances
        const result = Array.from(balances.values())
          .map(balance => ({
            ...balance,
            netBalance: balance.totalOwedToYou - balance.totalOwed
          }))
          .filter(balance => {
            // Only show contacts with non-zero balances OR unsettled expenses
            const hasUnsettledExpenses = balance.expenses.some(expense => 
              expense.splits.some(split => !split.isSettled)
            );
            return Math.abs(balance.netBalance) > 0.01 || hasUnsettledExpenses;
          });
        
        return result;
      },
      
      getContactBalance: (contactId) => {
        const balances = get().getContactBalances();
        return balances.find(balance => balance.contactId === contactId) || null;
      },
      
      // Fixed the getExpensesByContact function to avoid duplicates
      getExpensesByContact: (contactId) => {
        const state = get();
        const currentUserId = "current-user";
        
        // Use a Set to track unique expense IDs to prevent duplicates
        const uniqueExpenseIds = new Set<string>();
        const filteredExpenses: SharedExpense[] = [];
        
        state.expenses.forEach(expense => {
          // Skip if we've already processed this expense
          if (uniqueExpenseIds.has(expense.id)) {
            return;
          }
          
          let isRelevantExpense = false;
          
          // Check if this expense involves the specified contact
          if (expense.paidBy === currentUserId) {
            // Current user paid - check if contact has a split
            const contactSplit = expense.splits.find(split => split.contactId === contactId);
            if (contactSplit) {
              isRelevantExpense = true;
            }
          } else if (expense.paidBy === contactId) {
            // Contact paid - check if current user has a split
            const currentUserSplit = expense.splits.find(split => split.contactId === currentUserId);
            if (currentUserSplit) {
              isRelevantExpense = true;
            }
          }
          
          if (isRelevantExpense) {
            uniqueExpenseIds.add(expense.id);
            filteredExpenses.push(expense);
          }
        });
        
        return filteredExpenses;
      },
      
      deleteExpense: (expenseId) =>
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== expenseId)
        })),
        
      updateExpense: (expenseId, updates) =>
        set((state) => ({
          expenses: state.expenses.map(expense =>
            expense.id === expenseId
              ? { ...expense, ...updates }
              : expense
          )
        })),
        
      sendReminder: (contactId) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [contactId]: new Date().toISOString()
          }
        })),
        
      getLastReminderDate: (contactId) => {
        const state = get();
        return state.reminders[contactId] || null;
      }
    }),
    {
      name: "shared-expenses-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);