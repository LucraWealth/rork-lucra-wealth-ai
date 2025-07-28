import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated } from "react-native";
import { theme } from "@/constants/theme";
import { Eye, EyeOff, TrendingUp } from "lucide-react-native";
import Card from "./Card";

interface BalanceCardProps {
  balance: number;
  cashback: number;
  onAddMoney?: () => void;
  onSendMoney?: () => void;
}

export default function BalanceCard({
  balance,
  cashback,
  onAddMoney,
  onSendMoney,
}: BalanceCardProps) {
  const [hideBalance, setHideBalance] = React.useState(false);
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const toggleBalanceVisibility = () => {
    setHideBalance(!hideBalance);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddMoneyPress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onAddMoney?.();
  };

  const handleSendMoneyPress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onSendMoney?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.backgroundPattern}>
          <View style={styles.pattern1} />
          <View style={styles.pattern2} />
          <View style={styles.pattern3} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Total Balance</Text>
          <TouchableOpacity 
            onPress={toggleBalanceVisibility}
            style={styles.eyeButton}
          >
            {hideBalance ? (
              <EyeOff size={22} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={22} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.balance}>
          {hideBalance ? "••••••" : `$${balance.toFixed(2)}`}
        </Text>

        <View style={styles.cashbackContainer}>
          <View style={styles.cashbackIconContainer}>
            <TrendingUp size={16} color={theme.colors.primary} />
          </View>
          <Text style={styles.cashbackText}>
            ${cashback.toFixed(2)} cashback earned
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={handleAddMoneyPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={handleSendMoneyPress}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Send Money</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.xs,
    position: "relative",
    overflow: "hidden",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pattern1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(74, 227, 168, 0.03)",
    top: -30,
    right: -30,
  },
  pattern2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74, 227, 168, 0.05)",
    bottom: -20,
    left: 20,
  },
  pattern3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(74, 227, 168, 0.02)",
    top: 40,
    left: -10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    zIndex: 1,
  },
  title: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  eyeButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  balance: {
    ...theme.typography.h1,
    fontWeight: "800",
    marginBottom: theme.spacing.xs,
    color: "#FFFFFF",
    letterSpacing: -1,
    zIndex: 1,
  },
  cashbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    zIndex: 1,
  },
  cashbackIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(74, 227, 168, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  cashbackText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    zIndex: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  sendButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(74, 227, 168, 0.4)",
    ...theme.shadows.small,
  },
  actionButtonText: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: "#121212",
  },
  sendButtonText: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});