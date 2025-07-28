import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { ArrowLeft, Search, Filter, ShoppingBag } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function CashbackTransactionsScreen() {
  const router = useRouter();
  const { transactions } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [allCashbackTransactions, setAllCashbackTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
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
    
    // Load cashback transactions from wallet store
    loadCashbackTransactions();
  }, [transactions]);
  
  const loadCashbackTransactions = () => {
    // Filter transactions to get cashback transactions (payments)
    const cashbackTxs = transactions
      .filter(tx => tx.type === "payment")
      .map(tx => ({
        id: tx.id,
        title: tx.title,
        amount: tx.amount,
        cashback: tx.amount * 0.05, // 5% cashback
        date: new Date(tx.date).toLocaleDateString(),
        category: tx.category || "Other",
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setAllCashbackTransactions(cashbackTxs);
    setFilteredTransactions(cashbackTxs);
  };
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTransactions(allCashbackTransactions);
    } else {
      const filtered = allCashbackTransactions.filter(
        transaction => 
          transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, allCashbackTransactions]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadCashbackTransactions();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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
        <Text style={styles.transactionDate}>{item.date}</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cashback Transactions</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
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
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      </Animated.View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
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
  transactionsList: {
    paddingBottom: theme.spacing.xxl,
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
  transactionDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
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
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});