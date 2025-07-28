import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { ArrowUpRight, ArrowDownLeft, Calendar, DollarSign, Check, X, ArrowLeft, Plus } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useSharedExpensesStore, SharedExpense } from "@/store/sharedExpensesStore";
import { useWalletStore } from "@/store/walletStore";
import { ExpenseSplit } from "@/store/sharedExpensesStore";

const SharedExpenseDetailScreen = () => {
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    getContactBalance, 
    getExpensesByContact, 
    settleExpense, 
    settleAllWithContact 
  } = useSharedExpensesStore();
  const { contacts, balance, updateBalance, sendMoney } = useWalletStore();
  
  const contact = contacts.find(c => c.id === contactId);
  const contactBalance = getContactBalance(contactId!);
  const expenses = getExpensesByContact(contactId!);
  
  if (!contact || !contactBalance) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Contact Not Found",
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '600' },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color={theme.colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Contact or balance not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSettleAll = () => {
    const amountToSettle = Math.abs(contactBalance.netBalance);
    const isOwedToYou = contactBalance.netBalance > 0;
    
    if (isOwedToYou) {
      Alert.alert(
        "Settle Up",
        `${contact.name} will send you $${amountToSettle.toFixed(2)}. This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: () => {
              // Simulate receiving money
              updateBalance(amountToSettle);
              settleAllWithContact(contactId!);
              
              router.replace({
                pathname: '/settlement-success',
                params: {
                  contactName: contact.name,
                  amount: amountToSettle.toFixed(2),
                  type: 'received'
                }
              });
            }
          }
        ]
      );
    } else {
      if (balance < amountToSettle) {
        Alert.alert("Insufficient Funds", "You don't have enough balance to settle this amount.");
        return;
      }
      
      Alert.alert(
        "Settle Up",
        `Send $${amountToSettle.toFixed(2)} to ${contact.name}? This will be deducted from your Lucra balance.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send Money",
            onPress: () => {
              sendMoney(contact.name, amountToSettle, "Settling shared expenses");
              settleAllWithContact(contactId!);
              
              router.replace({
                pathname: '/settlement-success',
                params: {
                  contactName: contact.name,
                  amount: amountToSettle.toFixed(2),
                  type: 'sent'
                }
              });
            }
          }
        ]
      );
    }
  };

  const handleSettleExpense = (expense: SharedExpense) => {
    const currentUserId = "current-user";
    let split: ExpenseSplit | undefined;
    let isOwedToYou = false;
    
    // Determine the correct split and direction
    if (expense.paidBy === currentUserId) {
      // Current user paid - find contact's split
      split = expense.splits.find(s => s.contactId === contactId);
      isOwedToYou = true;
    } else if (expense.paidBy === contactId) {
      // Contact paid - find current user's split
      split = expense.splits.find(s => s.contactId === currentUserId);
      isOwedToYou = false;
    }
    
    if (!split) return;
    
    const amountToSettle = split.amount;
    
    if (isOwedToYou) {
      Alert.alert(
        "Settle Expense",
        `${contact.name} will send you $${amountToSettle.toFixed(2)} for "${expense.title}".`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: () => {
              updateBalance(amountToSettle);
              settleExpense(expense.id, contactId!);
              
              router.replace({
                pathname: '/settlement-success',
                params: {
                  contactName: contact.name,
                  amount: amountToSettle.toFixed(2),
                  type: 'received',
                  expenseTitle: expense.title
                }
              });
            }
          }
        ]
      );
    } else {
      if (balance < amountToSettle) {
        Alert.alert("Insufficient Funds", "You don't have enough balance to settle this expense.");
        return;
      }
      
      Alert.alert(
        "Settle Expense",
        `Send $${amountToSettle.toFixed(2)} to ${contact.name} for "${expense.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send Money",
            onPress: () => {
              sendMoney(contact.name, amountToSettle, `Settling: ${expense.title}`);
              settleExpense(expense.id, contactId!);
              
              router.replace({
                pathname: '/settlement-success',
                params: {
                  contactName: contact.name,
                  amount: amountToSettle.toFixed(2),
                  type: 'sent',
                  expenseTitle: expense.title
                }
              });
            }
          }
        ]
      );
    }
  };

  // FIXED: Simplified renderExpenseItem to avoid duplicates
  const renderExpenseItem = (expense: SharedExpense) => {
    const currentUserId = "current-user";
    let split: ExpenseSplit | undefined;
    let isOwedToYou = false;
    
    // Determine the correct split and direction for this specific contact
    if (expense.paidBy === currentUserId) {
      // Current user paid - find this contact's split
      split = expense.splits.find(s => s.contactId === contactId);
      isOwedToYou = true;
    } else if (expense.paidBy === contactId) {
      // This contact paid - find current user's split
      split = expense.splits.find(s => s.contactId === currentUserId);
      isOwedToYou = false;
    }
    
    // If no relevant split found for this contact relationship, don't render
    if (!split) return null;
    
    const isSettled = split.isSettled;
    amount = split.amount;
    
    return (
      <View key={expense.id} style={styles.expenseItem}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle}>{expense.title}</Text>
            <View style={styles.expenseMetaRow}>
              <Text style={styles.expenseCategory}>{expense.category}</Text>
              <Text style={styles.expenseDot}>•</Text>
              <Text style={styles.expenseDate}>
                {new Date(expense.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.expenseAmount}>
            <View style={[styles.amountIcon, isOwedToYou ? styles.positiveIcon : styles.negativeIcon]}>
              {isOwedToYou ? (
                <ArrowUpRight size={14} color={theme.colors.success} />
              ) : (
                <ArrowDownLeft size={14} color={theme.colors.error} />
              )}
            </View>
            <View style={styles.amountDetails}>
              <Text style={[styles.amountText, isOwedToYou ? styles.positiveAmount : styles.negativeAmount]}>
                ${amount.toFixed(2)}
              </Text>
              <Text style={styles.amountLabel}>
                {isOwedToYou ? 'owes you' : 'you owe'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.expenseDetails}>
          <Text style={styles.totalAmount}>Total expense: ${expense.totalAmount.toFixed(2)}</Text>
          {expense.description && (
            <Text style={styles.expenseDescription}>{expense.description}</Text>
          )}
        </View>
        
        <View style={styles.expenseActions}>
          {!isSettled ? (
            <TouchableOpacity
              style={styles.settleButton}
              onPress={() => handleSettleExpense(expense)}
            >
              <Check size={16} color={theme.colors.primary} />
              <Text style={styles.settleButtonText}>Settle This Expense</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.settledBadge}>
              <Check size={16} color={theme.colors.success} />
              <Text style={styles.settledText}>Settled</Text>
              {split.settledAt && (
                <Text style={styles.settledDate}>
                  on {new Date(split.settledAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const isOwedToYou = contactBalance.netBalance > 0;
  const netAmount = Math.abs(contactBalance.netBalance);
  const unsettledExpenses = expenses.filter(expense => 
    expense.splits.some(split => !split.isSettled)
  );

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense Details</Text>
            <View style={{ width: 24 }} />
          </View>
      <Stack.Screen
        options={{
          title: contact.name,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/add-shared-expense')}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Plus size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Summary */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, isOwedToYou ? styles.positiveCard : styles.negativeCard]}>
            <View style={styles.summaryIcon}>
              {isOwedToYou ? (
                <ArrowUpRight size={28} color={theme.colors.success} />
              ) : (
                <ArrowDownLeft size={28} color={theme.colors.error} />
              )}
            </View>
            
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>
                {isOwedToYou ? `${contact.name} owes you` : `You owe ${contact.name}`}
              </Text>
              <Text style={[styles.summaryAmount, isOwedToYou ? styles.positiveAmount : styles.negativeAmount]}>
                ${netAmount.toFixed(2)}
              </Text>
              <Text style={styles.expenseCountText}>
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''} total
              </Text>
            </View>
          </View>
          
          {netAmount > 0 && (
            <TouchableOpacity style={styles.settleAllButton} onPress={handleSettleAll}>
              <DollarSign size={20} color={theme.colors.background} />
              <Text style={styles.settleAllButtonText}>Settle Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Expenses List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Details</Text>
          
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No shared expenses</Text>
              <Text style={styles.emptySubtitle}>
                You haven't shared any expenses with {contact.name} yet
              </Text>
            </View>
          ) : (
            <View style={styles.expensesList}>
              {expenses.map(renderExpenseItem)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  positiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  negativeCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  positiveAmount: {
    color: theme.colors.success,
  },
  negativeAmount: {
    color: theme.colors.error,
  },
  settleAllButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  settleAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  expensesList: {
    gap: 16,
  },
  expenseItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 16,
  },
  expenseTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  expenseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  expenseDot: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginHorizontal: 6,
  },
  expenseDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  expenseAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  positiveIcon: {
    backgroundColor: 'rgba(74, 227, 168, 0.2)',
  },
  negativeIcon: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
  },
  amountDetails: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  amountLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  expenseDetails: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '40',
  },
  totalAmount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  expenseDescription: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  expenseActions: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '40',
  },
  settleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  settleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success + '15',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  settledText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.success,
  },
  expenseCountText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  settledDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SharedExpenseDetailScreen;