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
  Modal,
  Switch,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { 
  ArrowLeft, 
  Gift, 
  ShoppingBag, 
  Music, 
  ChevronRight, 
  Calendar, 
  X, 
  Filter, 
  Search,
  Plus,
  Check,
  AlertCircle
} from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import { CashbackChart } from "@/components/CashbackChart";
import { cashbackHistory, CashbackHistoryItem } from "@/mocks/cashback-history";

const { width: screenWidth } = Dimensions.get("window");

// Mock subscriptions data
const subscriptions = [
  {
    id: "sub-1",
    name: "Netflix",
    amount: 15.49,
    cashback: 0.77,
    category: "Entertainment",
    logoUrl: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/227_Netflix_logo-512.png",
    enabled: true,
  },
  {
    id: "sub-2",
    name: "Spotify",
    amount: 9.99,
    cashback: 0.50,
    category: "Music",
    logoUrl: "https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Spotify-512.png",
    enabled: true,
  },
  {
    id: "sub-3",
    name: "Amazon Prime",
    amount: 14.99,
    cashback: 0.75,
    category: "Shopping",
    logoUrl: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/12_Prime_Amazon_logo_logos-512.png",
    enabled: true,
  },
  {
    id: "sub-4",
    name: "Disney+",
    amount: 7.99,
    cashback: 0.40,
    category: "Entertainment",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/5969/5969017.png",
    enabled: false,
  },
];

// Subscription categories
const subscriptionCategories = [
  "Entertainment",
  "Music",
  "Shopping",
  "Productivity",
  "Utilities",
  "Health & Fitness",
  "Education",
  "News",
  "Other"
];

// Get current date to filter chart data
const getCurrentMonthData = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter cashback history to only show up to current month
  return cashbackHistory.filter(item => {
    const itemDate = new Date(item.date);
    return (itemDate.getFullYear() < currentYear) || 
           (itemDate.getFullYear() === currentYear && itemDate.getMonth() <= currentMonth);
  });
};

// LCRA token price constant
const LCRA_TOKEN_PRICE = 0.03; // $0.03 per LCRA token

export default function CashbackScreen() {
  const router = useRouter();
  const { cashback, transactions, payBill, bills, tokens } = useWalletStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State for selected data point
  const [selectedMonth, setSelectedMonth] = useState<CashbackHistoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get cashback transactions from wallet store
  const [cashbackTransactions, setCashbackTransactions] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>(subscriptions);
  
  // Month transactions modal
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [selectedMonthTransactions, setSelectedMonthTransactions] = useState<any[]>([]);
  
  // Add subscription modal
  const [addSubscriptionModalVisible, setAddSubscriptionModalVisible] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    amount: "",
    category: "Entertainment",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/5969/5969017.png",
  });
  const [subscriptionError, setSubscriptionError] = useState("");
  
  // Filtered chart data
  const [chartData, setChartData] = useState<CashbackHistoryItem[]>(getCurrentMonthData());
  
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
    
    // Load cashback transactions and subscriptions
    loadCashbackTransactions();
  }, [transactions]);
  
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
    
    // Update chart data based on transactions
    updateChartData();
  };
  
  const updateChartData = () => {
    // Get current month data
    const currentData = getCurrentMonthData();
    
    // Update the last month's amount based on current cashback
    if (currentData.length > 0) {
      const lastIndex = currentData.length - 1;
      currentData[lastIndex] = {
        ...currentData[lastIndex],
        amount: cashback, // Update with current cashback amount
      };
    }
    
    setChartData(currentData);
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadCashbackTransactions();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleRedeemCashback = () => {
    router.push("/redeem-cashback-amount");
  };
  
  const handlePointSelected = (point: CashbackHistoryItem, index: number) => {
    setSelectedMonth(point);
  };
  
  const handleMonthPress = () => {
    if (!selectedMonth) return;
    
    // Filter transactions for the selected month
    const monthDate = new Date(selectedMonth.date);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    const monthTxs = transactions
      .filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd && tx.type === "payment";
      })
      .map(tx => ({
        id: tx.id,
        title: tx.title,
        amount: tx.amount,
        cashback: tx.amount * 0.05, // 5% cashback
        date: tx.date,
        category: tx.category || "Other",
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setSelectedMonthTransactions(monthTxs);
    setMonthModalVisible(true);
  };
  
  const toggleSubscription = (id: string, enabled: boolean) => {
    setActiveSubscriptions(
      activeSubscriptions.map(sub => 
        sub.id === id ? { ...sub, enabled } : sub
      )
    );
  };
  
  const handleAddSubscription = () => {
    // Validate inputs
    if (!newSubscription.name.trim()) {
      setSubscriptionError("Please enter a subscription name");
      return;
    }
    
    if (!newSubscription.amount.trim() || isNaN(parseFloat(newSubscription.amount))) {
      setSubscriptionError("Please enter a valid amount");
      return;
    }
    
    // Create new subscription
    const amount = parseFloat(newSubscription.amount);
    const cashback = amount * 0.05; // 5% cashback
    
    const subscription = {
      id: `sub-${Date.now()}`,
      name: newSubscription.name,
      amount,
      cashback,
      category: newSubscription.category,
      logoUrl: newSubscription.logoUrl,
      enabled: true,
    };
    
    // Add to subscriptions
    setActiveSubscriptions([...activeSubscriptions, subscription]);
    
    // Reset form and close modal
    setNewSubscription({
      name: "",
      amount: "",
      category: "Entertainment",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/5969/5969017.png",
    });
    setSubscriptionError("");
    setAddSubscriptionModalVisible(false);
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
  
  const renderSubscriptionItem = ({ item }: any) => (
    <View style={styles.subscriptionItem}>
      <View style={styles.subscriptionLeft}>
        <Image 
          source={{ uri: item.logoUrl }} 
          style={styles.subscriptionLogo}
          defaultSource={{ uri: "https://via.placeholder.com/40" }}
        />
        <View style={styles.subscriptionDetails}>
          <Text style={styles.subscriptionTitle}>{item.name}</Text>
          <Text style={styles.subscriptionCategory}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.subscriptionRight}>
        <View style={styles.subscriptionAmounts}>
          <Text style={styles.subscriptionAmount}>${item.amount.toFixed(2)}/mo</Text>
          <Text style={styles.subscriptionCashback}>+${item.cashback.toFixed(2)}</Text>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={(value) => toggleSubscription(item.id, value)}
          trackColor={{ false: "rgba(255, 255, 255, 0.1)", true: "rgba(74, 227, 168, 0.3)" }}
          thumbColor={item.enabled ? theme.colors.primary : "rgba(255, 255, 255, 0.5)"}
        />
      </View>
    </View>
  );
  
  const renderMonthModal = () => (
    <Modal
      visible={monthModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setMonthModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedMonth?.fullMonth} {selectedMonth ? new Date(selectedMonth.date).getFullYear() : ""} Transactions
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setMonthModalVisible(false)}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalSummary}>
            <Text style={styles.modalSummaryLabel}>Total Cashback</Text>
            <Text style={styles.modalSummaryValue}>${selectedMonth?.amount.toFixed(2)}</Text>
          </View>
          
          <FlatList
            data={selectedMonthTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transactions found for this month</Text>
              </View>
            }
          />
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setMonthModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  const renderAddSubscriptionModal = () => (
    <Modal
      visible={addSubscriptionModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setAddSubscriptionModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.addSubscriptionContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Subscription</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setAddSubscriptionModalVisible(false);
                setSubscriptionError("");
                setNewSubscription({
                  name: "",
                  amount: "",
                  category: "Entertainment",
                  logoUrl: "https://cdn-icons-png.flaticon.com/512/5969/5969017.png",
                });
              }}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {subscriptionError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{subscriptionError}</Text>
            </View>
          ) : null}
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subscription Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Netflix, Spotify, etc."
              placeholderTextColor={theme.colors.placeholder}
              value={newSubscription.name}
              onChangeText={(text) => setNewSubscription({...newSubscription, name: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Monthly Amount ($)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="0.00"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="decimal-pad"
              value={newSubscription.amount}
              onChangeText={(text) => setNewSubscription({...newSubscription, amount: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {subscriptionCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newSubscription.category === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setNewSubscription({...newSubscription, category})}
                >
                  <Text 
                    style={[
                      styles.categoryButtonText,
                      newSubscription.category === category && styles.categoryButtonTextActive
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddSubscription}
          >
            <Text style={styles.addButtonText}>Add Subscription</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cashback</Text>
        <View style={{ width: 40 }} />
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
          {/* Header Section with Earned Cashback */}
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
          
          {/* Selected Month Info - Modernized design */}
          {selectedMonth && (
            <TouchableOpacity 
              style={styles.selectedMonthCard}
              onPress={handleMonthPress}
            >
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
              <View style={styles.selectedMonthAction}>
                <ChevronRight size={20} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Redeem Cashback Button - Moved below chart */}
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
            <Text style={styles.transactionsTitle}>Cashback Transactions</Text>
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
        
        {/* Subscriptions Section */}
        <Animated.View 
          style={[
            styles.subscriptionsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.subscriptionsHeader}>
            <Text style={styles.subscriptionsTitle}>Subscriptions</Text>
            <TouchableOpacity onPress={() => setAddSubscriptionModalVisible(true)}>
              <Text style={styles.seeAllText}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {activeSubscriptions.map(item => (
            <View key={item.id}>
              {renderSubscriptionItem({ item })}
            </View>
          ))}
          
          {/* Add Subscription Button */}
          <TouchableOpacity 
            style={styles.addSubscriptionButton}
            onPress={() => setAddSubscriptionModalVisible(true)}
          >
            <Plus size={20} color={theme.colors.primary} />
            <Text style={styles.addSubscriptionText}>Add Subscription</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      
      {/* Month Transactions Modal */}
      {renderMonthModal()}
      
      {/* Add Subscription Modal */}
      {renderAddSubscriptionModal()}
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
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
  // New modernized selected month card
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
  subscriptionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  subscriptionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  subscriptionsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
  },
  subscriptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  subscriptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subscriptionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "500",
    marginBottom: 2,
  },
  subscriptionCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  subscriptionRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionAmounts: {
    alignItems: "flex-end",
    marginRight: theme.spacing.md,
  },
  subscriptionAmount: {
    ...theme.typography.bodyMedium,
    marginBottom: 2,
  },
  subscriptionCashback: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
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
  // Add subscription button
  addSubscriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  addSubscriptionText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSummary: {
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  modalSummaryLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  modalSummaryValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  modalList: {
    padding: theme.spacing.lg,
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  modalCloseButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  modalCloseButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: "600",
  },
  // Add subscription modal
  addSubscriptionContainer: {
    width: "90%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  formInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryContainer: {
    flexDirection: "row",
    paddingVertical: theme.spacing.xs,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginRight: theme.spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: "rgba(74, 227, 168, 0.2)",
  },
  categoryButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  categoryButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
  },
  addButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.background,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
});