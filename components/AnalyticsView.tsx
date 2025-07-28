import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { theme } from "@/constants/theme";
import { useWalletStore } from "@/store/walletStore";
import TransactionItem from "@/components/TransactionItem";
import Card from "@/components/Card";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowLeft,
  BarChart3,
  PieChart
} from "lucide-react-native";

interface AnalyticsViewProps {
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
  title?: string;
  onBack?: () => void;
}

interface ExpenseGroup {
  category: string;
  amount: number;
  percentage: number;
  transactions: any[];
}

export default function AnalyticsView({ 
  dateRange, 
  category, 
  title = "Analytics",
  onBack 
}: AnalyticsViewProps) {
  const { transactions } = useWalletStore();
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    let filtered = transactions;

    // Filter by date range if provided
    if (dateRange) {
      filtered = getTransactionsByDateRange(dateRange.start, dateRange.end);
    }

    // Filter by category if provided
    if (category) {
      filtered = getTransactionsByCategory(
        category, 
        dateRange?.start, 
        dateRange?.end
      );
    }

    setFilteredTransactions(filtered);
    calculateAnalytics(filtered);
  }, [dateRange, category, transactions]);

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // For single day ranges, ensure we capture the entire day
    if (startDate === endDate) {
      // Set start to beginning of day
      start.setHours(0, 0, 0, 0);
      // Set end to end of day
      end.setHours(23, 59, 59, 999);
    } else {
      // For multi-day ranges, set proper boundaries
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const getTransactionsByCategory = (categoryName: string, startDate?: string, endDate?: string) => {
    let filtered = transactions;

    // First filter by date range if provided
    if (startDate && endDate) {
      filtered = getTransactionsByDateRange(startDate, endDate);
    }

    // Then filter by category
    return filtered.filter(transaction => {
      const matchesCategory = 
        (transaction.category && transaction.category.toLowerCase().includes(categoryName.toLowerCase())) ||
        (categoryName.toLowerCase() === "bills" && transaction.type === "payment") ||
        (categoryName.toLowerCase() === "transfers" && transaction.type === "send") ||
        (categoryName.toLowerCase() === "other" && !transaction.category);
      
      return matchesCategory;
    });
  };

  const calculateAnalytics = (transactionList: any[]) => {
    // Calculate totals
    const spent = transactionList
      .filter(t => t.type === "payment" || t.type === "send" || t.type === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const earned = transactionList
      .filter(t => t.type === "receive" || t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalSpent(spent);
    setTotalEarned(earned);

    // Group by category
    const categoryGroups: Record<string, any[]> = {};
    let totalExpenseAmount = 0;

    transactionList.forEach(transaction => {
      if (transaction.type === "payment" || transaction.type === "send" || transaction.type === "withdrawal") {
        const cat = transaction.category || 
                   (transaction.type === "payment" ? "Bills" : 
                   (transaction.type === "send" ? "Transfers" : "Other"));
        
        if (!categoryGroups[cat]) {
          categoryGroups[cat] = [];
        }
        categoryGroups[cat].push(transaction);
        totalExpenseAmount += transaction.amount;
      }
    });

    // Convert to expense groups with percentages
    const groups: ExpenseGroup[] = Object.entries(categoryGroups).map(([cat, txs]) => {
      const amount = txs.reduce((sum, t) => sum + t.amount, 0);
      return {
        category: cat,
        amount,
        percentage: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
        transactions: txs
      };
    });

    groups.sort((a, b) => b.amount - a.amount);
    setExpenseGroups(groups);
  };

  const formatDateRange = () => {
    if (!dateRange) return "All Time";
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };

    // Check if it's the same day
    if (dateRange.start === dateRange.end) {
      return formatDate(start);
    }

    if (start.getFullYear() === end.getFullYear()) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    } else {
      return `${start.getFullYear()} - ${end.getFullYear()}`;
    }
  };

  const getCategoryColor = (category: string, index: number) => {
    const colors = [
      "#4AE3A8", "#4A8FE7", "#FF6B6B", "#9B59B6", 
      "#F39C12", "#E74C3C", "#2ECC71", "#3498DB"
    ];
    return colors[index % colors.length];
  };

  const displayTransactions = selectedGroup 
    ? expenseGroups.find(g => g.category === selectedGroup)?.transactions || []
    : filteredTransactions;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{formatDateRange()}</Text>
        </View>
        <View style={styles.headerIcon}>
          <BarChart3 size={24} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <TrendingDown size={20} color="#FF6B6B" />
            </View>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: "rgba(74, 227, 168, 0.1)" }]}>
              <TrendingUp size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.summaryLabel}>Total Earned</Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
              ${totalEarned.toFixed(2)}
            </Text>
          </Card>
        </View>

        {/* Net Change */}
        <Card style={styles.netChangeCard}>
          <View style={styles.netChangeHeader}>
            <DollarSign size={20} color={theme.colors.text} />
            <Text style={styles.netChangeTitle}>Net Change</Text>
          </View>
          <Text style={[
            styles.netChangeAmount,
            { color: (totalEarned - totalSpent) >= 0 ? theme.colors.primary : "#FF6B6B" }
          ]}>
            {(totalEarned - totalSpent) >= 0 ? "+" : ""}${(totalEarned - totalSpent).toFixed(2)}
          </Text>
        </Card>

        {/* Category Breakdown */}
        {expenseGroups.length > 0 && (
          <Card style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <PieChart size={20} color={theme.colors.primary} />
              <Text style={styles.categoryTitle}>Expense Breakdown</Text>
            </View>
            
            <View style={styles.categoryList}>
              {expenseGroups.map((group, index) => (
                <TouchableOpacity
                  key={group.category}
                  style={[
                    styles.categoryItem,
                    selectedGroup === group.category && styles.categoryItemSelected
                  ]}
                  onPress={() => setSelectedGroup(
                    selectedGroup === group.category ? null : group.category
                  )}
                >
                  <View style={styles.categoryLeft}>
                    <View style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(group.category, index) }
                    ]} />
                    <Text style={styles.categoryName}>{group.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>${group.amount.toFixed(2)}</Text>
                    <Text style={styles.categoryPercentage}>{group.percentage}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Transactions List */}
        <Card style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>
              {selectedGroup ? `${selectedGroup} Transactions` : "All Transactions"}
            </Text>
            <Text style={styles.transactionsCount}>
              {displayTransactions.length} transaction{displayTransactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {displayTransactions.length > 0 ? (
            displayTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                id={transaction.id}
                type={transaction.type}
                title={transaction.title}
                amount={transaction.amount}
                date={transaction.date}
                recipient={transaction.recipient}
                onPress={() => {}}
                style={styles.transactionItem}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedGroup 
                  ? `No ${selectedGroup.toLowerCase()} transactions found`
                  : "No transactions found for this period"
                }
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    ...theme.typography.h4,
    fontWeight: "700",
    color: theme.colors.text,
  },
  netChangeCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: "center",
  },
  netChangeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  netChangeTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  netChangeAmount: {
    ...theme.typography.h2,
    fontWeight: "700",
  },
  categoryCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  categoryList: {
    gap: theme.spacing.sm,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  categoryItemSelected: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: "500",
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  categoryPercentage: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  transactionsCard: {
    padding: theme.spacing.lg,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  transactionsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  transactionsCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});