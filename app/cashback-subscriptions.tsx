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
  Switch,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { ArrowLeft, Search, Filter, Calendar, Plus } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

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
    nextPayment: "2023-06-15",
    frequency: "monthly",
  },
  {
    id: "sub-2",
    name: "Spotify",
    amount: 9.99,
    cashback: 0.50,
    category: "Music",
    logoUrl: "https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Spotify-512.png",
    enabled: true,
    nextPayment: "2023-06-10",
    frequency: "monthly",
  },
  {
    id: "sub-3",
    name: "Amazon Prime",
    amount: 14.99,
    cashback: 0.75,
    category: "Shopping",
    logoUrl: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/12_Prime_Amazon_logo_logos-512.png",
    enabled: true,
    nextPayment: "2023-06-20",
    frequency: "monthly",
  },
  {
    id: "sub-4",
    name: "Disney+",
    amount: 7.99,
    cashback: 0.40,
    category: "Entertainment",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/5969/5969017.png",
    enabled: false,
    nextPayment: "2023-06-25",
    frequency: "monthly",
  },
  {
    id: "sub-5",
    name: "YouTube Premium",
    amount: 11.99,
    cashback: 0.60,
    category: "Entertainment",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
    enabled: true,
    nextPayment: "2023-06-18",
    frequency: "monthly",
  },
  {
    id: "sub-6",
    name: "Apple Music",
    amount: 9.99,
    cashback: 0.50,
    category: "Music",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/731/731985.png",
    enabled: true,
    nextPayment: "2023-06-22",
    frequency: "monthly",
  },
  {
    id: "sub-7",
    name: "Adobe Creative Cloud",
    amount: 52.99,
    cashback: 2.65,
    category: "Software",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968520.png",
    enabled: true,
    nextPayment: "2023-06-05",
    frequency: "monthly",
  },
  {
    id: "sub-8",
    name: "Microsoft 365",
    amount: 6.99,
    cashback: 0.35,
    category: "Software",
    logoUrl: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
    enabled: false,
    nextPayment: "2023-06-12",
    frequency: "monthly",
  },
];

export default function CashbackSubscriptionsScreen() {
  const router = useRouter();
  const { transactions } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>(subscriptions);
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
    
    // Set initial filtered subscriptions
    setFilteredSubscriptions(allSubscriptions);
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSubscriptions(allSubscriptions);
    } else {
      const filtered = allSubscriptions.filter(
        subscription => 
          subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subscription.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubscriptions(filtered);
    }
  }, [searchQuery, allSubscriptions]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const toggleSubscription = (id: string, enabled: boolean) => {
    const updatedSubscriptions = allSubscriptions.map(sub => 
      sub.id === id ? { ...sub, enabled } : sub
    );
    setAllSubscriptions(updatedSubscriptions);
    setFilteredSubscriptions(
      searchQuery.trim() === "" 
        ? updatedSubscriptions 
        : updatedSubscriptions.filter(
            sub => 
              sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
    );
  };

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
          <Text style={styles.subscriptionFrequency}>
            {item.frequency} • Next: {new Date(item.nextPayment).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.subscriptionRight}>
        <View style={styles.subscriptionAmounts}>
          <Text style={styles.subscriptionAmount}>${item.amount.toFixed(2)}/mo</Text>
          <Text style={styles.cashbackAmount}>+${item.cashback.toFixed(2)}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subscriptions</Text>
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
              placeholder="Search subscriptions"
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Toggle subscriptions to enable or disable cashback rewards. You earn 5% cashback on all active subscriptions.
          </Text>
        </View>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text style={styles.summaryValue}>{allSubscriptions.filter(s => s.enabled).length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Monthly Spend</Text>
            <Text style={styles.summaryValue}>
              ${allSubscriptions.filter(s => s.enabled).reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Cashback</Text>
            <Text style={styles.summaryValue}>
              ${allSubscriptions.filter(s => s.enabled).reduce((sum, s) => sum + s.cashback, 0).toFixed(2)}
            </Text>
          </View>
        </View>
        
        {/* Add Subscription Button */}
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={theme.colors.background} />
          <Text style={styles.addButtonText}>Add Subscription</Text>
        </TouchableOpacity>
        
        {/* Subscriptions List */}
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderSubscriptionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.subscriptionsList}
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
              <Text style={styles.emptyText}>No subscriptions found</Text>
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
  infoBanner: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.background,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  subscriptionsList: {
    paddingBottom: theme.spacing.xxl,
  },
  subscriptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    marginBottom: 2,
  },
  subscriptionFrequency: {
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