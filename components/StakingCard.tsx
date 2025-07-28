import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";
import Card from "./Card";
import { TrendingUp } from "lucide-react-native";
import TokenIcon from "./TokenIcon";

interface StakingCardProps {
  tokenName: string;
  tokenSymbol: string;
  apy: number;
  stakedAmount: number;
  tokenPrice: number;
  iconUrl?: string;
  color?: string;
  tokenId: string;
  onPress?: () => void;
}

const StakingCard: React.FC<StakingCardProps> = ({
  tokenName,
  tokenSymbol,
  apy,
  stakedAmount,
  tokenPrice,
  iconUrl,
  color,
  tokenId,
  onPress,
}) => {
  const value = stakedAmount * tokenPrice;
  const dailyReward = (value * (apy / 100)) / 365;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.tokenInfo}>
            <TokenIcon 
              symbol={tokenSymbol} 
              iconUrl={iconUrl}
              color={color}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{tokenName}</Text>
              <Text style={styles.symbol}>{tokenSymbol}</Text>
            </View>
          </View>
          <View style={styles.apyContainer}>
            <View style={styles.apyBadge}>
              <TrendingUp
                size={12}
                color={theme.colors.primary}
                style={styles.apyIcon}
              />
              <Text style={styles.apyText}>{apy}% APY</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.stakingInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Staked Amount</Text>
            <Text style={styles.infoValue}>
              {stakedAmount.toFixed(4)} {tokenSymbol}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Value</Text>
            <Text style={styles.infoValue}>${value.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsLabel}>Daily Rewards</Text>
          <Text style={styles.rewardsValue}>
            +${dailyReward.toFixed(4)} / day
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.stakeMoreButton]}
            onPress={onPress}
          >
            <Text style={styles.actionButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
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
  apyContainer: {
    alignItems: "flex-end",
  },
  apyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  apyIcon: {
    marginRight: 4,
  },
  apyText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: theme.spacing.md,
  },
  stakingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  infoItem: {},
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  rewardsContainer: {
    backgroundColor: "rgba(74, 227, 168, 0.05)",
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  rewardsLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  rewardsValue: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.sm,
  },
  stakeMoreButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    fontWeight: "600",
  },
});

export default StakingCard;