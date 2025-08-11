import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TransactionItem from "@/components/TransactionItem";
import LucraCard from "@/components/LucraCard";
import BalanceCard from "@/components/BalanceCard";
import BudgetProgressBar from "@/components/BudgetProgressBar";
import { useWalletStore } from "@/store/walletStore";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  Bell,
  ChevronUp,
  ChevronDown,
  Send,
  ShoppingBag,
  Receipt,
  Menu,
  Gift,
  ShieldCheck,
  PieChart,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
} from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { balance, transactions, cashback, budgetCategories, updateBudgetSpending } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [hideCardDetails, setHideCardDetails] = useState(true);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showBalanceView, setShowBalanceView] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const balanceViewOpacity = useRef(new Animated.Value(1)).current;
  const transactionsViewOpacity = useRef(new Animated.Value(0)).current;
  const transactionsViewTranslateY = useRef(new Animated.Value(20)).current;
  const balanceViewTranslateY = useRef(new Animated.Value(0)).current;
  
  // Screen entry animation
  const screenFadeAnim = useRef(new Animated.Value(0)).current;

  const recentTransactions = transactions.slice(0, 5);

  // Calculate budget summary
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.limit, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const budgetRemaining = totalBudget - totalSpent;

  // Wait for component to mount before checking authentication
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Only navigate after component is mounted
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      // Use setTimeout to ensure navigation happens after render
      const timer = setTimeout(() => {
        router.replace("/onboarding");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Update budget spending when component mounts
      updateBudgetSpending();
      
      // Initial fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      
      // Screen entry animation
      Animated.timing(screenFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticated]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    updateBudgetSpending();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleView = () => {
    if (showBalanceView) {
      // Hide balance view, show transactions
      Animated.parallel([
        Animated.timing(balanceViewOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(balanceViewTranslateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(transactionsViewOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(transactionsViewTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Show balance view, hide transactions
      Animated.parallel([
        Animated.timing(balanceViewOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(balanceViewTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(transactionsViewOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(transactionsViewTranslateY, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setShowBalanceView(!showBalanceView);
  };

  const handleSendMoney = () => {
    router.push("/send-money");
  };

  const handleAddMoney = () => {
    router.push("/add-money");
  };

  const handleRequestMoney = () => {
    router.push("/request-money");
  };

  const handlePayBills = () => {
    router.push("/(tabs)/payments");
  };

  const handleViewTokens = () => {
    router.push("/tokens");
  };

  const handleViewAllTransactions = () => {
    router.push("/(tabs)/transactions");
  };
  
  const handleViewCashback = () => {
    router.push("/cashback");
  };

  const handleViewBudget = () => {
    router.push("/(tabs)/transactions?tab=budget");
  };

  const toggleCardDetails = () => {
    setHideCardDetails(!hideCardDetails);
  };

  const toggleSideMenu = () => {
    setShowSideMenu(!showSideMenu);
  };

  const getBudgetStatusColor = () => {
    if (budgetPercentage >= 100) return "#FF6B6B";
    if (budgetPercentage >= 80) return "#FFD166";
    return "#4AE3A8";
  };

  const getBudgetStatusIcon = () => {
    if (budgetPercentage >= 100) return AlertTriangle;
    if (budgetPercentage >= 80) return TrendingUp;
    return PieChart;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.View style={{ flex: 1, opacity: screenFadeAnim }}>
        <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
          <StatusBar style="light" />
          
          {/* Custom Header - Same as Notifications Screen */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleSideMenu} style={styles.menuButton}>
              <Menu size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Home</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/notification-settings")}
            >
              <Bell size={20} color={theme.colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
              <LucraCard
                cardNumber={hideCardDetails ? "•••• •••• •••• 9891" : "4242 4242 4242 9891"}
                expiryDate={hideCardDetails ? "••/••" : "01/30"}
                cardholderName={user?.name || "John Smith"}
                onPress={toggleCardDetails}
              />
            </Animated.View>

            {/* Toggle Button - Added more spacing above */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
                <View style={styles.toggleHandle} />
                {showBalanceView ? (
                  <ChevronDown size={20} color={theme.colors.textSecondary} />
                ) : (
                  <ChevronUp size={20} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Balance View - Visible when toggled */}
            <Animated.View 
              style={[
                styles.balanceView,
                { 
                  opacity: balanceViewOpacity,
                  transform: [{ translateY: balanceViewTranslateY }],
                  position: showBalanceView ? 'relative' : 'absolute',
                  zIndex: showBalanceView ? 2 : 0,
                  top: showBalanceView ? undefined : -1000,
                }
              ]}
            >
              <BalanceCard
                balance={balance}
                cashback={cashback}
                onAddMoney={handleAddMoney}
                onSendMoney={handleSendMoney}
              />
              
              {/* Quick Actions - 4 buttons in a single row layout */}
              <View style={styles.quickActionsContainer}>
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity style={styles.quickAction} onPress={handleSendMoney}>
                    <View style={styles.quickActionIcon}>
                      <ArrowUpRight size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Send</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickAction} onPress={handleRequestMoney}>
                    <View style={styles.quickActionIcon}>
                      <ArrowDownLeft size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Request</Text>
                  </TouchableOpacity>
                
                  <TouchableOpacity style={styles.quickAction} onPress={handlePayBills}>
                    <View style={styles.quickActionIcon}>
                      <Receipt size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Pay Bills</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickAction} onPress={handleViewTokens}>
                    <View style={styles.quickActionIcon}>
                      <Wallet size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.quickActionText}>Tokens</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Cashback Card */}
              {cashback > 0 && (
                <TouchableOpacity 
                  style={styles.cashbackCard}
                  onPress={handleViewCashback}
                >
                  <View style={styles.cashbackContent}>
                    <View style={styles.cashbackIconContainer}>
                      <Gift size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.cashbackInfo}>
                      <Text style={styles.cashbackTitle}>Cashback Rewards</Text>
                      <Text style={styles.cashbackAmount}>${cashback.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <ChevronUp size={30} color={theme.colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>
                </TouchableOpacity>
              )}
              
              {/* LINA AI Chat Button */}
              <TouchableOpacity 
                style={styles.linaAiCard}
                onPress={() => router.push('/lina-chat')}
                testID="lina-chat-button"
              >
                <View style={styles.cashbackContent}>
                  <View style={styles.linaAiIconContainer}>
                    <ShieldCheck size={24} color={theme.colors.info} />
                  </View>
                  <View style={styles.cashbackInfo}>
                    <Text style={styles.cashbackTitle}>Start a new chat with LINA</Text>
                    <Text style={styles.linaAiDescription}>Your AI financial assistant</Text>
                  </View>
                </View>
                <View style={styles.chevronContainer}>
                  <ChevronUp size={30} color={theme.colors.info} style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
              </TouchableOpacity>

              {/* Budget Summary Widget */}
              {budgetCategories.length > 0 && (
                <TouchableOpacity 
                  style={styles.budgetWidget}
                  onPress={handleViewBudget}
                >
                  <View style={styles.budgetContent}>
                    <View style={[styles.budgetIconContainer, { backgroundColor: getBudgetStatusColor() }]}>
                      {React.createElement(getBudgetStatusIcon(), { size: 24, color: "#FFFFFF" })}
                    </View>
                    <View style={styles.budgetInfo}>
                      <Text style={styles.budgetTitle}>Monthly Budget</Text>
                      <Text style={styles.budgetSummary}>
                        ${totalSpent.toFixed(0)} of ${totalBudget.toFixed(0)} spent
                      </Text>
                      <View style={styles.budgetProgressContainer}>
                        <BudgetProgressBar
                          spent={totalSpent}
                          limit={totalBudget}
                          color={getBudgetStatusColor()}
                          showPercentage={false}
                          height={6}
                        />
                      </View>
                      {budgetRemaining >= 0 ? (
                        <Text style={styles.budgetRemaining}>
                          ${budgetRemaining.toFixed(0)} remaining
                        </Text>
                      ) : (
                        <Text style={styles.budgetOverspent}>
                          ${Math.abs(budgetRemaining).toFixed(0)} over budget
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <ChevronUp size={30} color={theme.colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Transactions View */}
            <Animated.View 
              style={[
                styles.transactionsPanel, 
                { 
                  opacity: transactionsViewOpacity,
                  transform: [{ translateY: transactionsViewTranslateY }],
                  position: showBalanceView ? 'absolute' : 'relative',
                  zIndex: showBalanceView ? 0 : 2,
                  top: showBalanceView ? -1000 : undefined,
                }
              ]}
            >
              <View style={styles.transactionsHeader}>
                <Text style={styles.transactionsTitle}>Transactions</Text>
                <TouchableOpacity onPress={handleViewAllTransactions}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionsList}>
                <Text style={styles.transactionDateLabel}>TODAY</Text>
                {recentTransactions.slice(0, 2).map((transaction) => (
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
                ))}
                
                {recentTransactions.length > 2 && (
                  <>
                    <Text style={styles.transactionDateLabel}>YESTERDAY</Text>
                    {recentTransactions.slice(2).map((transaction) => (
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
                    ))}
                  </>
                )}
              </View>
            </Animated.View>
          </ScrollView>

          {/* Side Menu */}
          {showSideMenu && (
            <View style={styles.sideMenuOverlay}>
              <TouchableOpacity 
                style={styles.sideMenuDismiss} 
                onPress={toggleSideMenu}
                activeOpacity={1}
              />
              <SafeAreaView style={styles.sideMenuContainer} edges={['top', 'left', 'bottom']}>
                <ScrollView style={styles.sideMenu} showsVerticalScrollIndicator={false}>
                  <View style={styles.sideMenuHeader}>
                    <Text style={styles.sideMenuGreeting}>Hello, {user?.name}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={toggleSideMenu}>
                      <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.sideMenuContent}>
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/send-money");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <ArrowUpRight size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Send Money</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Transfer funds instantly</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/request-money");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <ArrowDownLeft size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Request Money</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Request payment from others</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/(tabs)/transactions");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <Wallet size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Transaction History</Text>
                        <Text style={styles.sideMenuItemSubtitle}>View all transactions</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/cashback");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <Gift size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Cashback Rewards</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Manage your rewards</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/(tabs)/payments");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <Receipt size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Pay Bills</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Manage bill payments</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/void-cheque");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <CreditCard size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Void Cheque</Text>
                        <Text style={styles.sideMenuItemSubtitle}>View and download void cheque</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/paper-statements");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <Receipt size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Paper Statements</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Manage paper statements</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/dispute-charges");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <ShieldCheck size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Dispute Charges</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Report unauthorized transactions</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.sideMenuDivider} />
                    
                    <Text style={styles.sideMenuSectionTitle}>ACCOUNT</Text>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/(tabs)/profile");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <CreditCard size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Profile Settings</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/security");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <ShieldCheck size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Security</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/card-request");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <CreditCard size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Request New Card</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Order a replacement card</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sideMenuItem}
                      onPress={() => {
                        toggleSideMenu();
                        router.push("/help");
                      }}
                    >
                      <View style={styles.sideMenuItemIcon}>
                        <ShieldCheck size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.sideMenuItemContent}>
                        <Text style={styles.sideMenuItemTitle}>Help & Support</Text>
                        <Text style={styles.sideMenuItemSubtitle}>Get assistance</Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        <ChevronUp size={16} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  linaAiCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(74, 143, 231, 0.1)", // Using info color with opacity
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 231, 0.2)", // Using info color with opacity
  },
  linaAiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 143, 231, 0.2)", // Using info color with opacity
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  linaAiDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.info,
    fontWeight: "500",
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  cardContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl, // Increased spacing between card and toggle
  },
  toggleContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg, // Increased spacing after toggle button
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  toggleHandle: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 8,
  },
  balanceView: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl, // Added top margin for more spacing between card and balance
  },
  quickActionsContainer: {
    marginTop: theme.spacing.lg, // Increased spacing before quick actions
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  quickAction: {
    alignItems: "center",
    width: '23%', // Changed to fit 4 items in a row
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  quickActionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  cashbackCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  cashbackContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cashbackIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 2,
  },
  cashbackAmount: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
  // Budget Widget Styles
  budgetWidget: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  budgetContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 2,
  },
  budgetSummary: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  budgetProgressContainer: {
    marginBottom: theme.spacing.xs,
  },
  budgetRemaining: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  budgetOverspent: {
    ...theme.typography.caption,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  chevronContainer: {
    width: 24,  // Increased from 1 to give more space
    height: 24, // Increased from 1 to give more space
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md, // Reduced from xl to md
    marginLeft: -theme.spacing.md, // Added negative margin to pull it left
  },
  transactionsPanel: {
    backgroundColor: "rgba(42, 42, 42, 0.5)",
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.lg,
    overflow: "hidden",
    marginTop: theme.spacing.md, // Added top margin for more spacing
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
  transactionsList: {
    marginBottom: theme.spacing.md,
  },
  transactionDateLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
    fontWeight: "500",
  },
  transactionItem: {
    marginBottom: theme.spacing.sm,
  },
  sideMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100,
  },
  sideMenuDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  sideMenuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "80%",
    backgroundColor: theme.colors.background,
    zIndex: 101,
  },
  sideMenu: {
    flex: 1,
    width: "100%",
  },
  sideMenuHeader: {
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  sideMenuGreeting: {
    ...theme.typography.h3,
    fontWeight: "600",
    color: theme.colors.text,
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.text,
    lineHeight: 28,
  },
  sideMenuContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sideMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  sideMenuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  sideMenuItemContent: {
    flex: 1,
  },
  sideMenuItemTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 2,
  },
  sideMenuItemSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  sideMenuDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: theme.spacing.lg,
  },
  sideMenuSectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontWeight: "600",
  },
});