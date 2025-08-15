import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TransactionItem from "@/components/TransactionItem";
import { useWalletStore, Transaction } from "@/store/walletStore";
import { ArrowLeft, Calendar, Filter } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function ExpenseCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { transactions } = useWalletStore();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  useEffect(() => {
    filterTransactions();
  }, [category, selectedPeriod, transactions]);

  const filterTransactions = () => {
    if (!category) return;

    const today = new Date();
    let startDate: Date = new Date();

    // Set date range based on selected period
    if (selectedPeriod === "7days") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (selectedPeriod === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (selectedPeriod === "year") {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    // Filter transactions by category and date range
    const filtered = transactions.filter(transaction => {
      const tDate = new Date(transaction.date);
      const matchesCategory = 
        (transaction.category && transaction.category.toLowerCase().includes(category.toLowerCase())) ||
        (category.toLowerCase() === "bills" && transaction.type === "payment") ||
        (category.toLowerCase() === "transfers" && transaction.type === "send") ||
        (category.toLowerCase() === "other" && !transaction.category) ||
        // Budget category mappings
        (category.toLowerCase() === "utilities" && 
         transaction.category && 
         (transaction.category.toLowerCase().includes("utilities") || 
          transaction.category.toLowerCase().includes("electric") || 
          transaction.category.toLowerCase().includes("water") || 
          transaction.category.toLowerCase().includes("gas") || 
          transaction.category.toLowerCase().includes("internet"))) ||
        (category.toLowerCase() === "food" && 
         transaction.category && 
         (transaction.category.toLowerCase().includes("food") || 
          transaction.category.toLowerCase().includes("restaurant") || 
          transaction.category.toLowerCase().includes("grocery") || 
          transaction.category.toLowerCase().includes("dining"))) ||
        (category.toLowerCase() === "entertainment" && 
         transaction.category && 
         (transaction.category.toLowerCase().includes("entertainment") || 
          transaction.category.toLowerCase().includes("movie") || 
          transaction.category.toLowerCase().includes("music") || 
          transaction.category.toLowerCase().includes("streaming"))) ||
        (category.toLowerCase() === "transportation" && 
         transaction.category && 
         (transaction.category.toLowerCase().includes("transportation") || 
          transaction.category.toLowerCase().includes("uber") || 
          transaction.category.toLowerCase().includes("gas") || 
          transaction.category.toLowerCase().includes("parking"))) ||
        (category.toLowerCase() === "shopping" && 
         transaction.category && 
         (transaction.category.toLowerCase().includes("shopping") || 
          transaction.category.toLowerCase().includes("amazon") || 
          transaction.category.toLowerCase().includes("store"))) ||
        (category.toLowerCase() === "health" && 
         transaction.category && 
         (transaction.category.toLowerCase().includes("health") || 
          transaction.category.toLowerCase().includes("fitness") || 
          transaction.category.toLowerCase().includes("medical") || 
          transaction.category.toLowerCase().includes("gym")));
      
      return matchesCategory && tDate >= startDate && tDate <= today;
    });

    setFilteredTransactions(filtered);

    // Calculate total amount
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    setTotalAmount(total);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Format category name for display
  const getDisplayCategoryName = () => {
    const categoryMappings: Record<string, string> = {
      "utilities": "Utilities",
      "food": "Food & Dining",
      "entertainment": "Entertainment",
      "transportation": "Transportation",
      "shopping": "Shopping",
      "health": "Health & Fitness",
      "bills": "Bills",
      "transfers": "Transfers",
      "other": "Other",
    };
    
    return categoryMappings[category?.toLowerCase() || ""] || categoryName;
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <StatusBar style="light" />
      
      {/* Custom Header - Same as Notifications Screen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getDisplayCategoryName()} Expenses</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>TOTAL {getDisplayCategoryName().toUpperCase()} EXPENSES</Text>
          <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
          
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodOption, selectedPeriod === "7days" && styles.periodOptionSelected]}
              onPress={() => handlePeriodChange("7days")}
            >
              <Text style={[styles.periodText, selectedPeriod === "7days" && styles.periodTextSelected]}>
                7 days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodOption, selectedPeriod === "month" && styles.periodOptionSelected]}
              onPress={() => handlePeriodChange("month")}
            >
              <Text style={[styles.periodText, selectedPeriod === "month" && styles.periodTextSelected]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodOption, selectedPeriod === "year" && styles.periodOptionSelected]}
              onPress={() => handlePeriodChange("year")}
            >
              
              <Text style={[styles.periodText, selectedPeriod === "year" && styles.periodTextSelected]}>
                Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>TRANSACTIONS</Text>
          
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                id={transaction.id}
                type={transaction.type}
                title={transaction.title}
                amount={transaction.amount}
                date={transaction.date}
                recipient={transaction.recipient}
                onPress={() => router.push(`/transaction/${transaction.id}`)}
                style={styles.transactionItem}
                showCashback={transaction.type === "payment"}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found for this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Custom Header Styles - Copied from notification-settings.tsx
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
  },
  summaryContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    ...theme.typography.h1,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  periodOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  periodOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  periodText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  periodTextSelected: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  transactionsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  transactionsTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  transactionItem: {
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});