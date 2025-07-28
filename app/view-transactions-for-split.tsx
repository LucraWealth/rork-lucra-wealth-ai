import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Stack, router } from "expo-router";
import { ArrowLeft, Plus, Calendar, DollarSign, ChevronRight } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useWalletStore, Transaction } from "@/store/walletStore";
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";

const ViewTransactionsForSplitScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const { transactions } = useWalletStore();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filterTransactionsByPeriod = (transactions: Transaction[]) => {
    const now = new Date();
    return transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      
      switch (selectedPeriod) {
        case 'today':
          return isToday(transactionDate);
        case 'week':
          return isThisWeek(transactionDate);
        case 'month':
          return isThisMonth(transactionDate);
        case 'all':
        default:
          return true;
      }
    });
  };

  const getSplittableTransactions = () => {
    // Filter for transactions that make sense to split (payments, not transfers)
    const splittableTypes = ['payment', 'withdrawal'];
    const splittableCategories = [
      'Food & Drink', 'Food', 'Entertainment', 'Transportation', 
      'Shopping', 'Utilities', 'Travel', 'Health', 'Home'
    ];
    
    return filterTransactionsByPeriod(transactions)
      .filter(transaction => 
        splittableTypes.includes(transaction.type) &&
        transaction.amount > 0 &&
        (transaction.category ? splittableCategories.includes(transaction.category) : true)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleTransactionSelect = (transaction: Transaction) => {
    // Navigate to add shared expense with pre-filled data
    router.push({
      pathname: '/add-shared-expense',
      params: {
        prefillTitle: transaction.title,
        prefillAmount: transaction.amount.toString(),
        prefillCategory: transaction.category || 'General',
        prefillDescription: transaction.description || '',
      }
    });
  };

  const formatTransactionDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'Food & Drink': '#FF6B6B',
      'Food': '#FF6B6B',
      'Transportation': '#4ECDC4',
      'Entertainment': '#45B7D1',
      'Shopping': '#96CEB4',
      'Utilities': '#FECA57',
      'Health': '#FF9FF3',
      'Travel': '#54A0FF',
      'Home': '#5F27CD',
    };
    return colors[category || ''] || theme.colors.primary;
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['today', 'week', 'month', 'all'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period === 'today' ? 'Today' : 
             period === 'week' ? 'This Week' :
             period === 'month' ? 'This Month' : 'All Time'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTransactionItem = (transaction: Transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionItem}
      onPress={() => handleTransactionSelect(transaction)}
    >
      <View style={styles.transactionLeft}>
        <View style={[
          styles.categoryIcon,
          { backgroundColor: getCategoryColor(transaction.category) + '20' }
        ]}>
          <DollarSign size={20} color={getCategoryColor(transaction.category)} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionCategory}>
            {transaction.category || 'General'} • {formatTransactionDate(transaction.date)}
          </Text>
          {transaction.description && (
            <Text style={styles.transactionDescription}>{transaction.description}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          ${transaction.amount.toFixed(2)}
        </Text>
        <ChevronRight size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const splittableTransactions = getSplittableTransactions();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Select Transaction to Split",
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
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
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Calendar size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Split Past Transactions</Text>
            <Text style={styles.infoSubtitle}>
              Select a transaction to automatically fill in the expense details
            </Text>
          </View>
        </View>

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Transactions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Splittable Transactions ({splittableTransactions.length})
          </Text>
          
          {splittableTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtitle}>
                No splittable transactions for the selected period
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.back()}
              >
                <Plus size={20} color={theme.colors.primary} />
                <Text style={styles.emptyButtonText}>Add Manual Expense</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {splittableTransactions.map(renderTransactionItem)}
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
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: theme.colors.background,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
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
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default ViewTransactionsForSplitScreen;