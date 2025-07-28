import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import { useWalletStore } from "@/store/walletStore";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Wallet,
  Clock,
  FileText,
  User,
  Tag,
  RefreshCw,
  DollarSign
} from "lucide-react-native";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { transactions } = useWalletStore();

  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getIcon = () => {
    switch (transaction.type) {
      case "send":
        return <ArrowUpRight size={24} color={theme.colors.error} />;
      case "receive":
        return <ArrowDownLeft size={24} color={theme.colors.success} />;
      case "payment":
        return <CreditCard size={24} color={theme.colors.warning} />;
      case "deposit":
        return <ArrowDownLeft size={24} color={theme.colors.success} />;
      case "withdrawal":
        return <Wallet size={24} color={theme.colors.info} />;
      case "swap":
        return <RefreshCw size={24} color={theme.colors.primary} />;
      case "buy":
        return <DollarSign size={24} color={theme.colors.success} />;
      case "sell":
        return <DollarSign size={24} color={theme.colors.error} />;
      default:
        return <ArrowUpRight size={24} color={theme.colors.error} />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.type) {
      case "send":
      case "payment":
      case "withdrawal":
      case "sell":
        return theme.colors.error;
      case "receive":
      case "deposit":
      case "buy":
        return theme.colors.success;
      case "swap":
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (transaction.type) {
      case "send":
        return "Sent";
      case "receive":
        return "Received";
      case "payment":
        return "Paid";
      case "deposit":
        return "Deposited";
      case "withdrawal":
        return "Withdrawn";
      case "swap":
        return "Swapped";
      case "buy":
        return "Bought";
      case "sell":
        return "Sold";
      default:
        return "Processed";
    }
  };

  const isPositive = transaction.type === "receive" || transaction.type === "deposit" || transaction.type === "buy";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text
          style={[
            styles.amount,
            isPositive ? styles.positiveAmount : styles.negativeAmount,
          ]}
        >
          {isPositive ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailLabel}>Date</Text>
            </View>
            <Text style={styles.detailValue}>{transaction.date}</Text>
          </View>

          {transaction.recipient && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <User size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailLabel}>Recipient</Text>
              </View>
              <Text style={styles.detailValue}>{transaction.recipient}</Text>
            </View>
          )}

          {transaction.category && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Tag size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailLabel}>Category</Text>
              </View>
              <Text style={styles.detailValue}>{transaction.category}</Text>
            </View>
          )}

          {transaction.description && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <FileText size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailLabel}>Description</Text>
              </View>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Tag size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailLabel}>Transaction ID</Text>
            </View>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>
        </Card>
      </View>
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
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  transactionTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  amount: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  positiveAmount: {
    color: theme.colors.success,
  },
  negativeAmount: {
    color: theme.colors.error,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    color: theme.colors.background,
    fontWeight: "600",
  },
  detailsCard: {
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  detailValue: {
    ...theme.typography.body,
    fontWeight: "500",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});