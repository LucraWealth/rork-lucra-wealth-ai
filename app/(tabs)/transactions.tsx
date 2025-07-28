import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TransactionItem from "@/components/TransactionItem";
import BudgetCategoryCard from "@/components/BudgetCategoryCard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useWalletStore, Transaction, BudgetCategory } from "@/store/walletStore";
import { transactions as mockTransactions } from "@/mocks/transactions";
import { 
  Calendar, 
  Filter, 
  Search, 
  Eye, 
  EyeOff, 
  Bell, 
  PieChart,
  Plus,
  TrendingUp,
  TrendingDown,
  Zap,
  Coffee,
  Music,
  Car,
  ShoppingBag,
  Heart,
  DollarSign,
  Target,
  ChevronDown,
  Check,
} from "lucide-react-native";

// Get unique transaction categories from existing transactions
const getTransactionCategories = () => {
  const categories = new Set<string>();
  mockTransactions.forEach(transaction => {
    if (transaction.category) {
      categories.add(transaction.category);
    }
  });
  return Array.from(categories).sort();
};

const { width: screenWidth } = Dimensions.get("window");

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ChartDataItem {
  day: string;
  amount: number;
  date: string;
  fullDate: string; // Add full date for better tracking
}

interface ExpenseGroup {
  category: string;
  amount: number;
  percentage: number;
}

const iconMap: Record<string, any> = {
  Zap,
  Coffee,
  Music,
  Car,
  ShoppingBag,
  Heart,
  DollarSign,
};

export default function TransactionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { transactions, balance, cashback, budgetCategories, setBudgetLimit, addBudgetCategory, removeBudgetCategory, updateBudgetSpending } = useWalletStore();
  
  // Tab state - check if budget tab should be active from params
  const [activeTab, setActiveTab] = useState<"transactions" | "budget">(
    params.tab === "budget" ? "budget" : "transactions"
  );
  
  // Transactions tab state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
  const [selectedBarIndex, setSelectedBarIndex] = useState(2);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [totalExpenditures, setTotalExpenditures] = useState(0);
  const [totalCashbackEarned, setTotalCashbackEarned] = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [maxChartAmount, setMaxChartAmount] = useState(1000);
  
  // Budget tab state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLimit, setNewCategoryLimit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("DollarSign");
  const [selectedColor, setSelectedColor] = useState("#4AE3A8");
  const [selectedTransactionCategory, setSelectedTransactionCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Get transaction categories
  const transactionCategories = getTransactionCategories();
  
  // Fixed animation arrays
  const barScaleValues = useRef<Animated.Value[]>([]).current;
  const barScaleYValues = useRef<Animated.Value[]>([]).current;
  
  // Screen entry animation
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const tabSwitchAnim = useRef(new Animated.Value(0)).current;

  // Initialize animation arrays
  useEffect(() => {
    if (barScaleValues.length === 0) {
      for (let i = 0; i < 12; i++) {
        barScaleValues[i] = new Animated.Value(1);
        barScaleYValues[i] = new Animated.Value(0);
      }
    }
  }, []);

  // Calculate expense groups
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);

  // Generate chart data
  useEffect(() => {
    if (activeTab === "transactions") {
      generateChartData();
      calculateExpenseGroups();
    }
  }, [selectedPeriod, transactions, activeTab]);
  
  // Update budget spending when budget tab is active
  useEffect(() => {
    if (activeTab === "budget") {
      updateBudgetSpending();
    }
  }, [activeTab]);
  
  // Screen entry animation
  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Tab switch animation
  useEffect(() => {
    Animated.timing(tabSwitchAnim, {
      toValue: activeTab === "budget" ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const generateChartData = () => {
    const today = new Date();
    let startDate: Date = new Date();
    let endDate: Date = new Date();
    let periodData: ChartDataItem[] = [];
  
    if (selectedPeriod === "7days") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      endDate = today;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayIndex = date.getDay();
        
        const dayTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.toDateString() === date.toDateString();
        });
        
        const amount = dayTransactions
          .filter(t => t.type === "send" || t.type === "payment" || t.type === "withdrawal")
          .reduce((sum, t) => sum + t.amount, 0);
        
        periodData.push({
          day: DAYS_OF_WEEK[dayIndex],
          amount,
          date: date.toISOString().split('T')[0],
          fullDate: date.toISOString().split('T')[0] // Store the full date for single-day analytics
        });
      }
    } else if (selectedPeriod === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const weeks = Math.ceil(endDate.getDate() / 7);
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(1 + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > endDate) weekEnd.setDate(endDate.getDate());
        
        const weekTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= weekStart && tDate <= weekEnd;
        });
        
        const amount = weekTransactions
          .filter(t => t.type === "send" || t.type === "payment" || t.type === "withdrawal")
          .reduce((sum, t) => sum + t.amount, 0);
        
        periodData.push({
          day: `W${i+1}`,
          amount,
          date: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`,
          fullDate: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`
        });
      }
    } else if (selectedPeriod === "year") {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(today.getFullYear(), i, 1);
        const monthEnd = new Date(today.getFullYear(), i + 1, 0);
        
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        });
        
        const amount = monthTransactions
          .filter(t => t.type === "send" || t.type === "payment" || t.type === "withdrawal")
          .reduce((sum, t) => sum + t.amount, 0);
        
        periodData.push({
          day: monthNames[i],
          amount,
          date: `${monthStart.toISOString().split('T')[0]} - ${monthEnd.toISOString().split('T')[0]}`,
          fullDate: `${monthStart.toISOString().split('T')[0]} - ${monthEnd.toISOString().split('T')[0]}`
        });
      }
    }
    
    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });
    
    const periodExpenditures = periodTransactions
      .filter(t => t.type === "send" || t.type === "payment" || t.type === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const periodCashback = periodTransactions
      .filter(t => t.type === "payment")
      .reduce((sum, t) => sum + (t.amount * 0.05), 0);
    
    setTotalExpenditures(periodExpenditures);
    setTotalCashbackEarned(periodCashback);
    setChartData(periodData);
    
    // Calculate max amount for proportional bars
    const maxAmount = Math.max(...periodData.map(item => item.amount), 1000);
    setMaxChartAmount(maxAmount);
    
    animateChartBars(periodData, maxAmount);
  };
  
  const animateChartBars = (data: ChartDataItem[], maxAmount: number) => {
    const animations = data.map((item, index) => {
      // Skip if animation value doesn't exist
      if (!barScaleYValues[index]) return null;
      
      // Calculate proportional height (0-1)
      const targetHeight = maxAmount > 0 ? Math.min(item.amount / maxAmount, 1) : 0;
      
      return Animated.spring(barScaleYValues[index], {
        toValue: targetHeight,
        friction: 8,
        useNativeDriver: true,
      });
    }).filter(Boolean);
  
    if (animations.length > 0) {
      Animated.parallel(animations as Animated.CompositeAnimation[]).start();
    }
  };

  const calculateExpenseGroups = () => {
    const categories: Record<string, number> = {};
    let totalAmount = 0;
    
    const today = new Date();
    let startDate: Date = new Date();
    
    if (selectedPeriod === "7days") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (selectedPeriod === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (selectedPeriod === "year") {
      startDate = new Date(today.getFullYear(), 0, 1);
    } else {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    }
    
    const filteredTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= today;
    });
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === "send" || transaction.type === "payment" || transaction.type === "withdrawal") {
        const category = transaction.category || 
                        (transaction.type === "payment" ? "Bills" : 
                        (transaction.type === "send" ? "Transfers" : "Other"));
        
        if (!categories[category]) {
          categories[category] = 0;
        }
        
        categories[category] += transaction.amount;
        totalAmount += transaction.amount;
      }
    });
    
    const groupsArray: ExpenseGroup[] = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    }));
    
    groupsArray.sort((a, b) => b.amount - a.amount);
    
    setExpenseGroups(groupsArray);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === "transactions") {
      generateChartData();
      calculateExpenseGroups();
    } else {
      updateBudgetSpending();
    }
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [selectedPeriod, activeTab]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleBarPress = (index: number) => {
    if (index >= barScaleValues.length) return;
    
    if (selectedBarIndex < barScaleValues.length) {
      Animated.spring(barScaleValues[selectedBarIndex], {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }

    Animated.sequence([
      Animated.spring(barScaleValues[index], {
        toValue: 0.9,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(barScaleValues[index], {
        toValue: 1.05,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(barScaleValues[index], {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedBarIndex(index);

    // Navigate to analytics for the selected day/period
    if (chartData[index]) {
      const selectedData = chartData[index];
      let startDate = selectedData.fullDate;
      let endDate = selectedData.fullDate;
      
      // Handle different date formats
      if (selectedData.fullDate.includes(' - ')) {
        const dates = selectedData.fullDate.split(' - ');
        startDate = dates[0];
        endDate = dates[1];
      } else {
        // For single day (7-day view), create a proper date range for the entire day
        // This ensures we capture all transactions from that day
        startDate = selectedData.fullDate;
        endDate = selectedData.fullDate;
      }
      
      router.push({
        pathname: "/monthly-spending",
        params: {
          startDate,
          endDate,
          title: `${selectedData.day} Analytics`,
        },
      });
    }
  };

  const handleExpenseGroupPress = (category: string) => {
    router.push(`/expense-category/${encodeURIComponent(category.toLowerCase())}`);
  };

  const handleBudgetCategoryPress = (categoryName: string) => {
    // Find the budget category to get its transaction category mapping
    const budgetCategory = budgetCategories.find(cat => cat.name === categoryName);
    const transactionCategory = budgetCategory?.transactionCategory || categoryName;
    
    // Use the transaction category for routing
    const mappedCategory = transactionCategory.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/expense-category/${encodeURIComponent(mappedCategory)}`);
  };

  const toggleBalanceVisibility = () => {
    setHideBalance(!hideBalance);
  };

  const handleViewRewards = () => {
    router.push("/cashback");
  };

  const handleBudgetPress = () => {
    setActiveTab("budget");
  };

  // Budget functions
  const handleEditBudget = (categoryId: string, newLimit: number) => {
    setBudgetLimit(categoryId, newLimit);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => removeBudgetCategory(categoryId)
        }
      ]
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryLimit && selectedTransactionCategory) {
      const limit = parseFloat(newCategoryLimit);
      if (!isNaN(limit) && limit > 0) {
        addBudgetCategory({
          name: newCategoryName,
          limit,
          color: selectedColor,
          icon: selectedIcon,
          transactionCategory: selectedTransactionCategory,
        });
        setShowAddModal(false);
        setNewCategoryName("");
        setNewCategoryLimit("");
        setSelectedIcon("DollarSign");
        setSelectedColor("#4AE3A8");
        setSelectedTransactionCategory("");
        setShowCategoryDropdown(false);
      }
    }
  };

  // Calculate budget totals
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.limit, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === "" ||
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.recipient && transaction.recipient.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedFilter === "all" || transaction.type === selectedFilter;

    return matchesSearch && matchesType;
  });

  const renderFilterOptions = () => {
    if (!filterVisible) return null;

    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Type</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "all" && styles.filterOptionSelected,
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "all" && styles.filterOptionTextSelected,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "send" && styles.filterOptionSelected,
            ]}
            onPress={() => setSelectedFilter("send")}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "send" && styles.filterOptionTextSelected,
              ]}
            >
              Sent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "receive" && styles.filterOptionSelected,
            ]}
            onPress={() => setSelectedFilter("receive")}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "receive" && styles.filterOptionTextSelected,
              ]}
            >
              Received
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedFilter === "payment" && styles.filterOptionSelected,
            ]}
            onPress={() => setSelectedFilter("payment")}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedFilter === "payment" && styles.filterOptionTextSelected,
              ]}
            >
              Bills
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.filterTitle}>Date Range</Text>
        <TouchableOpacity
          style={styles.dateRangeButton}
          onPress={() => router.push("/date-range-picker")}
        >
          <Calendar size={20} color={theme.colors.primary} />
          <Text style={styles.dateRangeText}>
            {dateRange.start && dateRange.end
              ? `${dateRange.start} - ${dateRange.end}`
              : "Select Date Range"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => setFilterVisible(false)}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransactionsTab = () => (
    <>
      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceHeader}>
          <View>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount}>
              {hideBalance ? "••••••" : `$${balance.toFixed(2)}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.eyeButton} onPress={toggleBalanceVisibility}>
            {hideBalance ? (
              <EyeOff size={20} color={theme.colors.text} />
            ) : (
              <Eye size={20} color={theme.colors.text} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Cashback Section */}
        <View style={styles.cashbackSection}>
          <Text style={styles.cashbackLabel}>CASHBACK EARNED</Text>
          <Text style={styles.cashbackAmount}>
            {hideBalance ? "••••••" : `$${cashback.toFixed(2)}`}
          </Text>
          <TouchableOpacity 
            style={styles.cashbackButton}
            onPress={handleViewRewards}
          >
            <Text style={styles.cashbackButtonText}>View Rewards</Text>
          </TouchableOpacity>
        </View>
        
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
      
      {/* Expenditures Chart */}
      <View style={styles.chartSection}>
        <View style={styles.expendituresHeader}>
          <View>
            <Text style={styles.expendituresLabel}>YOUR SPENDING</Text>
            <Text style={styles.expendituresAmount}>
              {hideBalance ? "••••••" : `$${totalExpenditures.toFixed(2)}`}
            </Text>
          </View>
          <View>
            <Text style={styles.cashbackEarnedLabel}>CASHBACK EARNED</Text>
            <Text style={styles.cashbackEarnedAmount}>
              {hideBalance ? "••••••" : `+$${totalCashbackEarned.toFixed(2)}`}
            </Text>
          </View>
        </View>
        
        {/* Horizontal scroll for months */}
        {selectedPeriod === "year" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalChartContainer}
          >
            {chartData.map((item, index) => {
              const barColor = index === selectedBarIndex 
                ? theme.colors.primary 
                : "#4AE3A8";
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.chartColumn}
                  onPress={() => handleBarPress(index)}
                  activeOpacity={0.7}
                >
                  <Animated.View 
                    style={[
                      styles.barContainer,
                      {
                        transform: [
                          { scale: barScaleValues[index] }
                        ]
                      }
                    ]}
                  >
                    {/* Base bar (gray background) */}
                    <View style={[
                      styles.barBase, 
                      { backgroundColor: "#2A2A2A" }
                    ]} />
                    
                    {/* Animated fill bar (using scaleY transform) */}
                    <Animated.View 
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: barColor,
                          transform: [
                            { 
                              scaleY: barScaleYValues[index] 
                            }
                          ]
                        }
                      ]}
                    />
                  </Animated.View>
                  <Text style={[
                    styles.dayLabel,
                    index === selectedBarIndex && { color: theme.colors.primary, fontWeight: "600" }
                  ]}>
                    {item.day}
                  </Text>
                  <Text style={[
                    styles.amountLabel,
                    index === selectedBarIndex && { color: theme.colors.primary, fontWeight: "600" }
                  ]}>
                    {hideBalance ? "••" : `$${item.amount.toFixed(0)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          // Regular layout for days/weeks
          <View style={styles.chartContainer}>
            {chartData.map((item, index) => {
              const barColor = index === selectedBarIndex 
                ? theme.colors.primary 
                : "#4AE3A8";
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.chartColumn}
                  onPress={() => handleBarPress(index)}
                  activeOpacity={0.7}
                >
                  <Animated.View 
                    style={[
                      styles.barContainer,
                      {
                        transform: [
                          { scale: barScaleValues[index] }
                        ]
                      }
                    ]}
                  >
                    {/* Base bar (gray background) */}
                    <View style={[
                      styles.barBase, 
                      { backgroundColor: "#2A2A2A" }
                    ]} />
                    
                    {/* Animated fill bar (using scaleY transform) */}
                    <Animated.View 
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: barColor,
                          transform: [
                            { 
                              scaleY: barScaleYValues[index] 
                            }
                          ]
                        }
                      ]}
                    />
                  </Animated.View>
                  <Text style={[
                    styles.dayLabel,
                    index === selectedBarIndex && { color: theme.colors.primary, fontWeight: "600" }
                  ]}>
                    {item.day}
                  </Text>
                  <Text style={[
                    styles.amountLabel,
                    index === selectedBarIndex && { color: theme.colors.primary, fontWeight: "600" }
                  ]}>
                    {hideBalance ? "••" : `$${item.amount.toFixed(0)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      
      {/* Expense Groups */}
      <View style={styles.expenseGroupsSection}>
        <Text style={styles.sectionLabel}>EXPENSE GROUPS</Text>
        <View style={styles.expenseGroupsContainer}>
          {expenseGroups.length > 0 ? (
            expenseGroups.map((group, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.expenseGroup}
                onPress={() => handleExpenseGroupPress(group.category)}
                activeOpacity={0.7}
              >
                <Text style={styles.expenseAmount}>
                  {hideBalance ? "••••••" : `$${group.amount.toFixed(2)}`}
                </Text>
                <Text style={styles.expensePercentage}>{group.percentage}%</Text>
                <Text style={styles.expenseCategory}>{group.category}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyExpenseGroups}>
              <Text style={styles.emptyText}>No expense data for this period</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(!filterVisible)}
        >
          <Filter size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {renderFilterOptions()}

      {/* Transactions List */}
      <View style={styles.transactionsListContainer}>
        <Text style={styles.transactionsListTitle}>TRANSACTION HISTORY</Text>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((item) => (
            <TransactionItem
              key={item.id}
              id={item.id}
              type={item.type}
              title={item.title}
              amount={item.amount}
              date={item.date}
              recipient={item.recipient}
              onPress={() => router.push(`/transaction/${item.id}`)}
              style={styles.transactionItem}
              showCashback={item.type === "payment"}
              hideAmount={hideBalance}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        )}
      </View>
    </>
  );

  const getOverallStatusColor = () => {
    if (overallPercentage >= 100) return "#FF6B6B";
    if (overallPercentage >= 80) return "#FFD166";
    return "#4AE3A8";
  };

  const renderBudgetTab = () => (
    <Animated.View 
      style={[
        styles.budgetContainer,
        {
          opacity: tabSwitchAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [{
            translateY: tabSwitchAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }
      ]}
    >
      {/* Summary Section */}
      <Card style={[styles.summaryCard, theme.shadows.medium]}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleContainer}>
            <Target size={20} color={theme.colors.primary} />
            <Text style={styles.summaryTitle}>Monthly Budget</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getOverallStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getOverallStatusColor() }]}>
              {overallPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Budget</Text>
            <Text style={styles.statAmount}>${totalBudget.toFixed(2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={[styles.statAmount, { color: "#FF6B6B" }]}>
              ${totalSpent.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statAmount, { color: getOverallStatusColor() }]}>
              ${Math.abs(totalRemaining).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.overallProgress}>
          <View style={styles.progressHeader}>
            {totalRemaining >= 0 ? (
              <TrendingUp size={18} color="#4AE3A8" />
            ) : (
              <TrendingDown size={18} color="#FF6B6B" />
            )}
            <Text style={[
              styles.progressText,
              { color: totalRemaining >= 0 ? "#4AE3A8" : "#FF6B6B" }
            ]}>
              {totalRemaining >= 0 ? "On track" : "Over budget"}
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(overallPercentage, 100)}%`,
                    backgroundColor: getOverallStatusColor(),
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {budgetCategories.length > 0 ? (
          budgetCategories.map((category, index) => (
            <BudgetCategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditBudget}
              onDelete={handleDeleteCategory}
              onPress={handleBudgetCategoryPress}
              index={index}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIcon}>
                <PieChart size={40} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No categories yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first budget category to start tracking spending
              </Text>
              <Button
                title="Add Category"
                onPress={() => setShowAddModal(true)}
                style={styles.emptyButton}
              />
            </View>
          </Card>
        )}
      </View>
    </Animated.View>
  );

  const colors = [
    "#4AE3A8", "#4A8FE7", "#FF6B6B", "#9B59B6", 
    "#F39C12", "#E74C3C", "#2ECC71", "#3498DB"
  ];

  const icons = ["Zap", "Coffee", "Music", "Car", "ShoppingBag", "Heart", "DollarSign"];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.View style={{ flex: 1, opacity: screenFadeAnim }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
            <StatusBar style="light" />
            
            {/* Custom Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={handleBudgetPress}
              >
                <PieChart size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {activeTab === "transactions" ? "Transactions" : "Budget"}
              </Text>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push("/notification-settings")}
              >
                <Bell size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modern Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "transactions" && styles.tabButtonActive
                ]}
                onPress={() => setActiveTab("transactions")}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === "transactions" && styles.tabButtonTextActive
                ]}>
                  Transactions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "budget" && styles.tabButtonActive
                ]}
                onPress={() => setActiveTab("budget")}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === "budget" && styles.tabButtonTextActive
                ]}>
                  Budget
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Tab Content */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.primary}
                  colors={[theme.colors.primary]}
                />
              }
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
            >
              {activeTab === "transactions" ? renderTransactionsTab() : renderBudgetTab()}
            </ScrollView>

            {/* Add Category Modal */}
            <Modal
              visible={showAddModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAddModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Budget Category</Text>
                  
                  <TextInput
                    style={styles.modalInput}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Category name"
                    returnKeyType="next"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  
                  <TextInput
                    style={styles.modalInput}
                    value={newCategoryLimit}
                    onChangeText={setNewCategoryLimit}
                    placeholder="Budget limit"
                    returnKeyType="next"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                  />

                  {/* Transaction Category Mapping */}
                  <Text style={styles.selectionLabel}>Map to Transaction Category *</Text>
                  <View style={styles.categoryDropdown}>
                    <TouchableOpacity
                      style={[
                        styles.dropdownButton,
                        !selectedTransactionCategory && styles.dropdownPlaceholder
                      ]}
                      onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                      <Text style={[
                        styles.dropdownText,
                        !selectedTransactionCategory && styles.dropdownPlaceholderText
                      ]}>
                        {selectedTransactionCategory || "Select transaction category"}
                      </Text>
                      <ChevronDown 
                        size={20} 
                        color={theme.colors.textSecondary}
                        style={[
                          styles.dropdownIcon,
                          showCategoryDropdown && styles.dropdownIconRotated
                        ]}
                      />
                    </TouchableOpacity>
                    
                    {showCategoryDropdown && (
                      <View style={styles.dropdownList}>
                        <ScrollView 
                          style={styles.dropdownScrollView}
                          nestedScrollEnabled
                          showsVerticalScrollIndicator={false}
                        >
                          {getTransactionCategories().map((category) => (
                            <TouchableOpacity
                              key={category}
                              style={[
                                styles.dropdownItem,
                                selectedTransactionCategory === category && styles.dropdownItemSelected
                              ]}
                              onPress={() => {
                                setSelectedTransactionCategory(category);
                                setShowCategoryDropdown(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                selectedTransactionCategory === category && styles.dropdownItemTextSelected
                              ]}>
                                {category}
                              </Text>
                              {selectedTransactionCategory === category && (
                                <Check size={16} color={theme.colors.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Icon Selection */}
                  <Text style={styles.selectionLabel}>Choose Icon</Text>
                  <View style={styles.iconGrid}>
                    {icons.map((iconName) => {
                      const IconComponent = iconMap[iconName];
                      return (
                        <TouchableOpacity
                          key={iconName}
                          style={[
                            styles.iconOption,
                            selectedIcon === iconName && styles.iconOptionSelected
                          ]}
                          onPress={() => setSelectedIcon(iconName)}
                        >
                          <IconComponent size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Color Selection */}
                  <Text style={styles.selectionLabel}>Choose Color</Text>
                  <View style={styles.colorGrid}>
                    {colors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorOptionSelected
                        ]}
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setShowAddModal(false);
                        setShowCategoryDropdown(false);
                      }}
                      variant="outline"
                      style={styles.modalButton}
                    />
                    <Button
                      title="Add Category"
                      onPress={handleAddCategory}
                      style={[
                        styles.modalButton,
                        (!newCategoryName || !newCategoryLimit || !selectedTransactionCategory) && styles.modalButtonDisabled
                      ]}
                      disabled={!newCategoryName || !newCategoryLimit || !selectedTransactionCategory}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
  },
  budgetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.small,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.small,
  },
  // Modern Tab Switcher Styles
  tabSwitcher: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    ...theme.shadows.small,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  tabButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: theme.colors.background,
    fontWeight: "700",
  },
  // Budget Container
  budgetContainer: {
    flex: 1,
  },
  balanceSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 0,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  balanceAmount: {
    ...theme.typography.h1,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  cashbackSection: {
    marginBottom: theme.spacing.sm,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  cashbackLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  cashbackAmount: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  cashbackButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: "rgba(74, 227, 168, 0.2)",
    borderRadius: theme.borderRadius.sm,
  },
  cashbackButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
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
  chartSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  expendituresHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  expendituresLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  expendituresAmount: {
    ...theme.typography.h3,
    fontWeight: "700",
  },
  cashbackEarnedLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: "right",
  },
  cashbackEarnedAmount: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "700",
    textAlign: "right",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: theme.spacing.sm,
  },
  // Horizontal scrolling for months
  horizontalChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.xl,
  },
  chartColumn: {
    alignItems: "center",
    marginHorizontal: 4,
    minWidth: 40,
  },
  barContainer: {
    height: 120,
    justifyContent: "flex-end",
    marginBottom: 8,
    width: 24,
  },
  barBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  barFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    transformOrigin: 'bottom',
  },
  dayLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontSize: 12,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: "500",
    fontSize: 12,
  },
  expenseGroupsSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  expenseGroupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  expenseGroup: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  expenseAmount: {
    ...theme.typography.body,
    fontWeight: "700",
    marginBottom: 2,
  },
  expensePercentage: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  emptyExpenseGroups: {
    width: "100%",
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    marginRight: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  filterTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  filterOptionTextSelected: {
    color: theme.colors.background,
    fontWeight: "600",
  },
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: theme.spacing.md,
  },
  dateRangeText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  applyButtonText: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.background,
  },
  transactionsListContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 16,
  },
  transactionsListTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginVertical: theme.spacing.sm,
  },
  transactionItem: {
    marginBottom: theme.spacing.sm,
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
  // Budget Tab Styles
  summaryCard: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.1)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  summaryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTitle: {
    ...theme.typography.h4,
    fontWeight: "700",
    marginLeft: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: "700",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: theme.spacing.sm,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  statAmount: {
    ...theme.typography.h4,
    fontWeight: "700",
    fontSize: 18,
  },
  overallProgress: {
    marginTop: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  progressBarContainer: {
    marginTop: theme.spacing.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  categoriesSection: {
    paddingHorizontal: theme.spacing.xl,
    flex: 1,
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "700",
  },
  addCategoryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxl,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderStyle: "dashed",
  },
  emptyContent: {
    alignItems: "center",
    maxWidth: 280,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    minWidth: 150,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: "100%",
    maxWidth: 400,
    height: "80%",
    overflow: "hidden",
  },
  modalTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  selectionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#FFFFFF",
    ...theme.shadows.small,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  // Budget tab specific scroll content
  budgetScrollContent: {
    paddingTop: 0,
    paddingBottom: 120,
    flexGrow: 1,
  },
  // Category dropdown styles
  categoryDropdown: {
    marginBottom: theme.spacing.lg,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownPlaceholder: {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dropdownText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownPlaceholderText: {
    color: theme.colors.textSecondary,
  },
  dropdownIcon: {
    marginLeft: theme.spacing.sm,
    transform: [{ rotate: "0deg" }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownScrollView: {
    maxHeight: 150,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primary + "20",
  },
  dropdownItemText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});