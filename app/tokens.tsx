import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TokenCard from "@/components/TokenCard";
import { useWalletStore } from "@/store/walletStore";
import { Bell, Plus, TrendingUp, ArrowUpDown, Droplet, ArrowLeft } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function TokensScreen() {
  const router = useRouter();
  const { tokens, balance } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"balance" | "name" | "price">("balance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Calculate total portfolio value
  const portfolioValue = tokens.reduce(
    (sum, token) => sum + token.balance * token.price,
    0
  );

  // Sort tokens
  const sortedTokens = [...tokens].sort((a, b) => {
    if (sortBy === "balance") {
      const aValue = a.balance * a.price;
      const bValue = b.balance * b.price;
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    } else if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    }
  });

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSort = (by: "balance" | "name" | "price") => {
    if (sortBy === by) {
      toggleSortOrder();
    } else {
      setSortBy(by);
      setSortOrder("desc");
    }
  };

  const handleAddToken = () => {
    router.push("/add-token");
  };

  const handleTokenPress = (id: string) => {
    router.push(`/token/${id}`);
  };
  
  const handleStakingPress = () => {
    router.push("/staking-intro");
  };
  
  const handleLiquidityPress = () => {
    router.push("/liquidity-pools");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tokens</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notification-settings")}
        >
          <Bell size={20} color={theme.colors.text} />
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
        <Animated.View
          style={[
            styles.portfolioCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.portfolioLabel}>Portfolio Value</Text>
          <Text style={styles.portfolioValue}>${portfolioValue.toFixed(2)}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
          </View>
        </Animated.View>

        {/* Updated to 2-column grid layout */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToken}
          >
            <View style={styles.actionIcon}>
              <Plus size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Token</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/token-swap")}
          >
            <View style={styles.actionIcon}>
              <ArrowUpDown size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStakingPress}
          >
            <View style={styles.actionIcon}>
              <TrendingUp size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Stake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLiquidityPress}
          >
            <View style={styles.actionIcon}>
              <Droplet size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Liquidity</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "balance" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("balance")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "balance" && styles.activeSortButtonText,
              ]}
            >
              Value {sortBy === "balance" && (sortOrder === "asc" ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "name" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("name")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "name" && styles.activeSortButtonText,
              ]}
            >
              Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "price" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("price")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "price" && styles.activeSortButtonText,
              ]}
            >
              Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {sortedTokens.map((token) => (
            <TokenCard
              key={token.id}
              name={token.name}
              symbol={token.symbol}
              balance={token.balance}
              price={token.price}
              change={token.change}
              color={token.color}
              onPress={() => handleTokenPress(token.id)}
            />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  portfolioCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  portfolioLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  portfolioValue: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  balanceValue: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "column",
    alignItems: "center",
    width: "48%", // Changed to fit 2 items in a row
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  actionText: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    textAlign: "center",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  sortButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  activeSortButton: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
  },
  sortButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  activeSortButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  tokenCard: {
    marginBottom: theme.spacing.md,
  },
});