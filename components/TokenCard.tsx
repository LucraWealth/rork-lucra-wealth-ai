import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";
import Card from "./Card";
import { TrendingUp, TrendingDown, Gift } from "lucide-react-native";
import TokenIcon from "./TokenIcon";

interface TokenCardProps {
  name: string;
  symbol: string;
  balance: number;
  price: number;
  change: number;
  iconUrl?: string;
  color?: string;
  onPress?: () => void;
  showCashback?: boolean;
  cashbackAmount?: number;
}

const TokenCard: React.FC<TokenCardProps> = ({
  name,
  symbol,
  balance,
  price,
  change,
  iconUrl,
  color,
  onPress,
  showCashback = false,
  cashbackAmount = 0,
}) => {
  const isPositiveChange = change >= 0;
  const value = balance * price;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.tokenInfo}>
            <TokenIcon 
              symbol={symbol} 
              iconUrl={iconUrl}
              color={color}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.symbol}>{symbol}</Text>
            </View>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPositiveChange
                    ? "rgba(74, 227, 168, 0.1)"
                    : "rgba(255, 59, 48, 0.1)",
                },
              ]}
            >
              {isPositiveChange ? (
                <TrendingUp
                  size={12}
                  color={theme.colors.success}
                  style={styles.changeIcon}
                />
              ) : (
                <TrendingDown
                  size={12}
                  color={theme.colors.error}
                  style={styles.changeIcon}
                />
              )}
              <Text
                style={[
                  styles.changeText,
                  {
                    color: isPositiveChange
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {isPositiveChange ? "+" : ""}
                {change.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.balanceContainer}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>
              {balance.toFixed(4)} {symbol}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Value</Text>
            <Text style={styles.balanceValue}>${value.toFixed(2)}</Text>
          </View>
        </View>

        {showCashback && cashbackAmount > 0 && (
          <View style={styles.cashbackContainer}>
            <Gift size={16} color={theme.colors.primary} />
            <Text style={styles.cashbackText}>
              Available Cashback: ${cashbackAmount.toFixed(2)}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameContainer: {
    marginLeft: theme.spacing.md,
  },
  name: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  symbol: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  price: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.sm,
  },
  changeIcon: {
    marginRight: 2,
  },
  changeText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: theme.spacing.md,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceItem: {},
  balanceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  balanceValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  cashbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
    alignSelf: "flex-start",
  },
  cashbackText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
})

export default TokenCard;