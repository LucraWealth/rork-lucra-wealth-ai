import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { theme } from "@/constants/theme";
import { ArrowUpRight, ArrowDownLeft, CreditCard, ShoppingBag, TrendingUp, Gift } from "lucide-react-native";

interface TransactionItemProps {
  id: string;
  type: "send" | "receive" | "payment" | "deposit" | "withdrawal" | "swap" | "buy" | "sell" | "cashback";
  title: string;
  amount: number;
  date: string;
  recipient?: string;
  onPress: () => void;
  style?: ViewStyle;
  showCashback?: boolean;
  hideAmount?: boolean;
}

export default function TransactionItem({
  type,
  title,
  amount,
  date,
  onPress,
  style,
  showCashback = false,
  hideAmount = false,
}: TransactionItemProps) {
  // Simplify the title if it contains an email
  const simplifyTitle = (title: string) => {
    // If the title contains "to" or "from" followed by an email, extract just the name part
    if (title.includes("@")) {
      // For "Sent to user@example.com" -> "Sent to User"
      const match = title.match(/^(Sent to|Received from) ([^@]+)@/);
      if (match) {
        const prefix = match[1];
        const name = match[2].trim();
        // Capitalize first letter of name
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        return `${prefix} ${capitalizedName}`;
      }
    }
    return title;
  };

  const displayTitle = simplifyTitle(title);

  // Format the time from the date string (e.g., "2023-06-15" -> "1:22 PM")
  const formatTime = () => {
    // For now, just return a mock time based on the transaction type
    if (type === "send") return "1:22 PM";
    if (type === "receive") return "12:32 PM";
    if (type === "payment") return "12:45 PM";
    if (type === "cashback") return "11:30 AM";
    return "10:22 AM";
  };

  // Calculate cashback amount (5% for payments)
  const cashbackAmount = showCashback ? amount * 0.05 : 0;

  // Get the icon based on transaction type
  const getIcon = () => {
    switch (type) {
      case "send":
        return <ArrowUpRight size={20} color="#FFFFFF" />;
      case "receive":
      case "deposit":
        return <ArrowDownLeft size={20} color="#FFFFFF" />;
      case "payment":
      case "withdrawal":
        return <ShoppingBag size={20} color="#FFFFFF" />;
      case "swap":
      case "buy":
      case "sell":
        return <CreditCard size={20} color="#FFFFFF" />;
      case "cashback":
        return <Gift size={20} color="#FFFFFF" />;
      default:
        return <CreditCard size={20} color="#FFFFFF" />;
    }
  };

  // Get background color for the icon container
  const getIconBgColor = () => {
    switch (type) {
      case "send":
        return "#2A2A2A";
      case "receive":
        return "#2A2A2A";
      case "payment":
        return "#2A2A2A";
      case "cashback":
        return "rgba(74, 227, 168, 0.2)";
      default:
        return "#2A2A2A";
    }
  };

  // Get amount color
  const getAmountColor = () => {
    switch (type) {
      case "send":
      case "payment":
      case "withdrawal":
      case "buy":
        return theme.colors.text;
      case "receive":
      case "deposit":
      case "sell":
      case "cashback":
        return "#4CD964"; // Green for positive amounts
      default:
        return theme.colors.text;
    }
  };

  // Get amount prefix
  const getAmountPrefix = () => {
    switch (type) {
      case "send":
      case "payment":
      case "withdrawal":
      case "buy":
        return "";
      case "receive":
      case "deposit":
      case "sell":
      case "cashback":
        return "+";
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
        {getIcon()}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{date}</Text>
        
        {showCashback && cashbackAmount > 0 && type !== "cashback" && (
          <View style={styles.cashbackContainer}>
            <TrendingUp size={12} color={theme.colors.primary} />
            <Text style={styles.cashbackText}>+${cashbackAmount.toFixed(2)} cashback</Text>
          </View>
        )}
      </View>
      
      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {hideAmount ? "••••••" : `${getAmountPrefix()}$${amount.toFixed(2)}`}
        </Text>
        <Text style={styles.time}>{formatTime()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  cashbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  cashbackText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  rightContent: {
    alignItems: "flex-end",
  },
  amount: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});