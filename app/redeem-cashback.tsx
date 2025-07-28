import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { ArrowLeft, Bell, Gift, ShoppingBag, Music, ChevronRight } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import CashbackChart from "@/components/CashbackChart";
import { cashbackHistory, cashbackTransactions } from "@/mocks/cashback-history";

const { width: screenWidth } = Dimensions.get("window");

export default function RedeemCashbackScreen() {
  const router = useRouter();
  const { cashback } = useWalletStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State for selected data point
  const [selectedMonth, setSelectedMonth] = useState(cashbackHistory[cashbackHistory.length - 1]);
  
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
  }, []);
  
  const handleRedeemCashback = () => {
    router.push("/redeem-cashback-amount");
  };
  
  const handleViewAllTransactions = () => {
    router.push("/cashback");
  };

  const handlePointSelected = (point: any, index: number) => {
    setSelectedMonth(point);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards Statistics</Text>
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
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Earned Cashback</Text>
              <Text style={styles.statValue}>${cashback.toFixed(2)}</Text>
            </View>
            {/* <View style={styles.statBox}>
              <Text style={styles.statLabel}>Token Balance</Text>
              <Text style={styles.statValue}>1141 LCRA</Text>
            </View> */}
          </View>
          
          {/* Interactive Cashback Chart */}
          <View style={styles.chartWrapper}>
            <CashbackChart 
              data={cashbackHistory}
              height={220}
              width={screenWidth - 40}
              onPointSelected={handlePointSelected}
            />
          </View>
          
          {/* Selected Month Info */}
          {selectedMonth && (
            <View style={styles.selectedMonthInfo}>
              <Text style={styles.selectedMonthLabel}>{selectedMonth.fullMonth} Cashback</Text>
              <Text style={styles.selectedMonthValue}>${selectedMonth.amount.toFixed(2)}</Text>
            </View>
          )}
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
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
            <Text style={styles.transactionsTitle}>Transaction</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Cashback Transactions */}
          {cashbackTransactions.slice(0, 5).map((transaction) => (
            <TouchableOpacity 
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => router.push(`/transaction/${transaction.id}`)}
            >
              <View style={styles.transactionIconContainer}>
                <ShoppingBag size={20} color={theme.colors.text} />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
              </View>
              <View style={styles.transactionAmounts}>
                <Text style={styles.transactionAmount}>-${transaction.amount.toFixed(2)}</Text>
                <Text style={styles.cashbackAmount}>+${transaction.cashback.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h3,
    fontWeight: "700",
  },
  chartWrapper: {
    marginBottom: theme.spacing.md,
  },
  selectedMonthInfo: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  selectedMonthLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  selectedMonthValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  actionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  redeemButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    marginBottom: theme.spacing.xxl,
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
  viewAllText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
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
});