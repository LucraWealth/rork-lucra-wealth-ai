import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { 
  Gift, 
  ShoppingBag, 
  ChevronRight, 
  Calendar, 
  Bell,
} from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import { CashbackChart } from "@/components/CashbackChart";
import { cashbackHistory, CashbackHistoryItem } from "@/mocks/cashback-history";

const { width: screenWidth } = Dimensions.get("window");

// Get current date to filter chart data
const getCurrentMonthData = (currentCashback: number) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter cashback history to only show up to current month
  const filteredData = cashbackHistory.filter(item => {
    const itemDate = new Date(item.date);
    return (itemDate.getFullYear() < currentYear) || 
           (itemDate.getFullYear() === currentYear && itemDate.getMonth() <= currentMonth);
  });
  
  // Update the current month's data with actual cashback amount
  if (filteredData.length > 0) {
    const lastIndex = filteredData.length - 1;
    const lastItem = filteredData[lastIndex];
    const lastItemDate = new Date(lastItem.date);
    
    // Check if the last item is the current month
    if (lastItemDate.getFullYear() === currentYear && lastItemDate.getMonth() === currentMonth) {
      filteredData[lastIndex] = {
        ...lastItem,
        amount: currentCashback, // Use actual cashback amount
      };
    }
  }
  
  return filteredData;
};

// LCRA token price constant
const LCRA_TOKEN_PRICE = 0.03; // $0.03 per LCRA token

export default function CashbackScreen() {
  const router = useRouter();
  const { cashback, transactions } = useWalletStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State for selected data point
  const [selectedMonth, setSelectedMonth] = useState<CashbackHistoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get cashback transactions from wallet store
  const [cashbackTransactions, setCashbackTransactions] = useState<any[]>([]);
  
  // Filtered chart data - updated to use current cashback
  const [chartData, setChartData] = useState<CashbackHistoryItem[]>([]);
  
  // Calculate token balance based on cashback amount
  const tokenBalance = Math.round(cashback / LCRA_TOKEN_PRICE);
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Load cashback transactions and update chart data
    loadCashbackTransactions();
    updateChartData();
  }, [transactions, cashback]);
  
  // Set default selected month to current month
  useEffect(() => {
    if (chartData.length > 0 && !selectedMonth) {
      // Find current month in chart data
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      let currentMonthIndex = chartData.length - 1; // Default to last month
      
      // Try to find current month
      for (let i = 0; i < chartData.length; i++) {
        const dataDate = new Date(chartData[i].date);
        const dataMonthYear = `${dataDate.getFullYear()}-${dataDate.getMonth() + 1}`;
        
        if (dataMonthYear === currentMonthYear) {
          currentMonthIndex = i;
          break;
        }
      }
      
      setSelectedMonth(chartData[currentMonthIndex]);
    }
  }, [chartData]);
  
  const loadCashbackTransactions = () => {
    // Filter transactions to get cashback transactions (payments)
    const cashbackTxs = transactions
      .filter(tx => tx.type === "payment")
      .map(tx => ({
        id: tx.id,
        title: tx.title,
        amount: tx.amount,
        cashback: tx.amount * 0.05, // 5% cashback
        date: tx.date,
        category: tx.category || "Other",
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Get only the 5 most recent
    
    setCashbackTransactions(cashbackTxs);
  };
  
  const updateChartData = () => {
    // Get current month data with actual cashback amount
    const currentData = getCurrentMonthData(cashback);
    setChartData(currentData);
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadCashbackTransactions();
    updateChartData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [cashback]);
  
  const handleRedeemCashback = () => {
    router.push("/redeem-cashback-amount");
  };
  
  const handlePointSelected = (point: CashbackHistoryItem, index: number) => {
    setSelectedMonth(point);
  };

  const renderTransactionItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => router.push(`/transaction/${item.id}`)}
    >
      <View style={styles.transactionIconContainer}>
        <ShoppingBag size={20} color={theme.colors.text} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
      </View>
      <View style={styles.transactionAmounts}>
        <Text style={styles.transactionAmount}>-${item.amount.toFixed(2)}</Text>
        <Text style={styles.cashbackAmount}>+${item.cashback.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cashback</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notification-settings")}
        >
          <Bell size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View 
          style={[
            styles.statsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header Section with Earned Cashback - Remove TouchableOpacity if it exists */}
          <View style={styles.headerSection}>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Earned Cashback</Text>
              <Text style={styles.headerValue}>${cashback.toFixed(2)}</Text>
            </View>
            {/* <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Token Balance</Text>
              <Text style={styles.headerValue}>{tokenBalance} LCRA</Text>
            </View> */}
          </View>
          
          {/* Interactive Cashback Chart */}
          <View style={styles.chartWrapper}>
            <CashbackChart 
              data={chartData}
              height={220}
              width={screenWidth - 40}
              onPointSelected={handlePointSelected}
              horizontalScrollEnabled={true}
            />
          </View>
          
          {/* Selected Month Info - Make sure this is not pressable for date selection */}
          {selectedMonth && (
            <View style={styles.selectedMonthCard}>
              <View style={styles.selectedMonthContent}>
                <View style={styles.selectedMonthHeader}>
                  <Calendar size={18} color={theme.colors.primary} />
                  <Text style={styles.selectedMonthTitle}>
                    {selectedMonth.fullMonth} {new Date(selectedMonth.date).getFullYear()}
                  </Text>
                </View>
                <View style={styles.selectedMonthValue}>
                  <Text style={styles.selectedMonthAmount}>${selectedMonth.amount.toFixed(2)}</Text>
                  <Text style={styles.selectedMonthLabel}>Cashback Earned</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.selectedMonthAction}
                onPress={() => router.push("/cashback-transactions")}
              >
                <ChevronRight size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Redeem Cashback Button */}
          <TouchableOpacity 
            style={styles.redeemButton}
            onPress={handleRedeemCashback}
          >
            <View style={styles.redeemButtonContent}>
              <View style={styles.redeemIconContainer}>
                <Gift size={24} color={theme.colors.background} />
              </View>
              <View style={styles.redeemTextContainer}>
                <Text style={styles.redeemTitle}>Redeem Cashback</Text>
                <Text style={styles.redeemDescription}>
                  Convert your cashback to cash or tokens
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.colors.background} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Cashback Transactions Section */}
        <Animated.View 
          style={[
            styles.transactionsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Cashback</Text>
            <TouchableOpacity onPress={() => router.push("/cashback-transactions")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={cashbackTransactions.length > 0 ? cashbackTransactions : []}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cashback transactions found</Text>
              </View>
            }
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  headerItem: {
    flex: 1,
  },
  headerLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  headerValue: {
    ...theme.typography.h2,
    fontWeight: "700",
  },
  chartWrapper: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  selectedMonthCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.1)",
  },
  selectedMonthContent: {
    flex: 1,
  },
  selectedMonthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  selectedMonthTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  selectedMonthValue: {
    marginTop: theme.spacing.xs,
  },
  selectedMonthAmount: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  selectedMonthLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  selectedMonthAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  redeemButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  redeemButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  redeemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  redeemTextContainer: {
    flex: 1,
  },
  redeemTitle: {
    ...theme.typography.bodyMedium,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.background,
    marginBottom: 2,
  },
  redeemDescription: {
    ...theme.typography.caption,
    color: "rgba(0, 0, 0, 0.7)",
  },
  transactionsContainer: {
    marginBottom: theme.spacing.lg,
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
  },
  seeAllText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  transactionAmounts: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    ...theme.typography.bodyMedium,
    marginBottom: 2,
  },
  cashbackAmount: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});