import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { ArrowLeft, TrendingUp, Clock, Calendar, ChevronRight } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import TokenIcon from "@/components/TokenIcon";

export default function StakingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getStakingPosition, tokens } = useWalletStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  }, []);
  
  const position = getStakingPosition(id as string);
  const token = tokens.find(t => t.symbol === position?.symbol);
  
  if (!position) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staking Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Staking position not found</Text>
          <Button
            title="View Staking Options"
            onPress={() => router.push("/staking-options")}
            variant="secondary"
            size="medium"
            style={styles.viewOptionsButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const calculateTotalValue = () => {
    return position.stakedAmount * position.tokenPrice;
  };
  
  const calculateTotalReward = () => {
    return calculateTotalValue() * (position.apy / 100) * (position.progress / 100);
  };
  
  const handleStakeMore = () => {
    router.push({
      pathname: "/stake-more",
      params: { id: position.id },
    });
  };
  
  const handleUnstake = () => {
    if (position.progress < 100) {
      Alert.alert(
        "Early Unstaking",
        "Unstaking before the lock period ends may result in reduced rewards. Do you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => router.push({
              pathname: "/unstake",
              params: { id: position.id },
            }),
          },
        ]
      );
    } else {
      router.push({
        pathname: "/unstake",
        params: { id: position.id },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{position.name} Staking</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <Card variant="elevated" style={styles.stakingCard}>
            <View style={styles.stakingHeader}>
              <View style={styles.tokenInfo}>
                <TokenIcon 
                  symbol={position.symbol}
                  iconUrl={position.iconUrl}
                  size={40}
                  color={token?.color || theme.colors.primary}
                />
                <View>
                  <Text style={styles.tokenName}>{position.name}</Text>
                  <Text style={styles.tokenSymbol}>{position.symbol}</Text>
                </View>
              </View>
              <View style={styles.apyContainer}>
                <TrendingUp size={16} color={theme.colors.primary} />
                <Text style={styles.apyText}>{position.apy}% APY</Text>
              </View>
            </View>
            
            <View style={styles.stakingInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Staked Amount</Text>
                <Text style={styles.infoValue}>
                  {position.stakedAmount} {position.symbol}
                </Text>
                <Text style={styles.infoSubvalue}>
                  ${calculateTotalValue().toFixed(2)}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Earned</Text>
                <Text style={styles.infoValue}>
                  {position.totalEarned} {position.symbol}
                </Text>
                <Text style={styles.infoSubvalue}>
                  ${(position.totalEarned * position.tokenPrice).toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.stakingProgress}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Lock Period Progress</Text>
                <Text style={styles.progressValue}>{position.progress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${position.progress}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressDates}>
                <View style={styles.dateItem}>
                  <Calendar size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.dateText}>Start: {position.startDate}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Calendar size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.dateText}>End: {position.endDate}</Text>
                </View>
              </View>
            </View>
          </Card>
          
          <Card style={styles.rewardsCard}>
            <Text style={styles.rewardsTitle}>Rewards</Text>
            
            <View style={styles.rewardsInfo}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardLabel}>Daily Reward</Text>
                <Text style={styles.rewardValue}>
                  {position.dailyReward} {position.symbol}
                </Text>
                <Text style={styles.rewardSubvalue}>
                  ${(position.dailyReward * position.tokenPrice).toFixed(2)}
                </Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardLabel}>Lock Period</Text>
                <Text style={styles.rewardValue}>
                  {position.lockPeriod} days
                </Text>
                <View style={styles.lockInfoContainer}>
                  <Clock size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.lockInfoText}>
                    {position.progress < 100 ? `${Math.ceil(position.lockPeriod * (1 - position.progress / 100))} days left` : "Completed"}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRewards}>
              <Text style={styles.totalRewardsLabel}>Estimated Total Rewards</Text>
              <Text style={styles.totalRewardsValue}>
                {(calculateTotalValue() * (position.apy / 100) * (position.lockPeriod / 365)).toFixed(4)} {position.symbol}
              </Text>
              <Text style={styles.totalRewardsSubvalue}>
                ${(calculateTotalValue() * (position.apy / 100) * (position.lockPeriod / 365) * position.tokenPrice).toFixed(2)}
              </Text>
            </View>
          </Card>
          
          {/* Always use vertical layout for buttons to prevent truncation */}
          <View style={styles.actionsColumn}>
            <Button
              title="Stake More"
              onPress={handleStakeMore}
              variant="secondary"
              size="large"
              style={styles.fullWidthButton}
            />
            <Button
              title="Unstake"
              onPress={handleUnstake}
              variant="primary"
              size="large"
              style={styles.fullWidthButton}
            />
          </View>
          
          <Card style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>About Staking</Text>
            <Text style={styles.infoCardText}>
              Staking allows you to earn rewards by locking your tokens for a specific period. 
              The longer you stake, the more rewards you can earn. Early unstaking may result in reduced rewards.
            </Text>
          </Card>
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
  stakingCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  stakingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenName: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  tokenSymbol: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  apyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  apyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  stakingInfo: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.text,
  },
  infoSubvalue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stakingProgress: {
    marginTop: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressDates: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  rewardsCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  rewardsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  rewardsInfo: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  rewardItem: {
    flex: 1,
    alignItems: "center",
  },
  rewardLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  rewardValue: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.text,
  },
  rewardSubvalue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  lockInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  lockInfoText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: theme.spacing.md,
  },
  totalRewards: {
    alignItems: "center",
  },
  totalRewardsLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  totalRewardsValue: {
    ...theme.typography.h4,
    fontWeight: "700",
    color: theme.colors.text,
  },
  totalRewardsSubvalue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actionsColumn: {
    flexDirection: "column",
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  fullWidthButton: {
    width: "100%",
  },
  infoCard: {
    marginBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  infoCardTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  infoCardText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  notFoundText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  viewOptionsButton: {
    marginTop: theme.spacing.md,
  },
});