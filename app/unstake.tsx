import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { ArrowLeft, TrendingUp, Info, Clock, AlertCircle } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function UnstakeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { stakingPositions } = useWalletStore();
  
  // Find the staking position from the store
  const position = stakingPositions.find(p => p.id === id);
  
  // If position not found, use mock data
  const getTokenData = () => {
    if (position) {
      return {
        name: position.name,
        symbol: position.symbol,
        apy: position.apy,
        stakedAmount: position.stakedAmount,
        balance: 0, // Not needed for unstaking
        price: position.tokenPrice,
        iconUrl: position.iconUrl,
        lockPeriod: `${position.lockPeriod} days`,
        minStake: 0.001, // Default
        earlyUnstakeFee: position.progress < 100 ? 5 : 0, // Apply fee if not completed
      };
    }
    
    // Fallback mock data if position not found
    switch (id) {
      case "btc":
        return {
          name: "Bitcoin",
          symbol: "BTC",
          apy: 5.2,
          stakedAmount: 0.015,
          balance: 0.025,
          price: 42000,
          iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025",
          lockPeriod: "30 days",
          minStake: 0.001,
          earlyUnstakeFee: 5,
        };
      case "eth":
        return {
          name: "Ethereum",
          symbol: "ETH",
          apy: 7.5,
          stakedAmount: 0.5,
          balance: 0.75,
          price: 2800,
          iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025",
          lockPeriod: "14 days",
          minStake: 0.01,
          earlyUnstakeFee: 3,
        };
      case "lumi":
        return {
          name: "Lumi Token",
          symbol: "LUMI",
          apy: 12.0,
          stakedAmount: 150,
          balance: 250,
          price: 0.15,
          iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
          lockPeriod: "7 days",
          minStake: 10,
          earlyUnstakeFee: 2,
        };
      // case "lcra":
      //   return {
      //     name: "Lucra",
      //     symbol: "LCRA",
      //     apy: 12.5,
      //     stakedAmount: 250,
      //     balance: 500,
      //     price: 1.25,
      //     iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
      //     lockPeriod: "14 days",
      //     minStake: 10,
      //     earlyUnstakeFee: 2,
      //   };
      case "sol":
        return {
          name: "Solana",
          symbol: "SOL",
          apy: 6.2,
          stakedAmount: 10,
          balance: 10,
          price: 120,
          iconUrl: "https://cryptologos.cc/logos/solana-sol-logo.png?v=025",
          lockPeriod: "30 days",
          minStake: 1,
          earlyUnstakeFee: 3,
        };
      default:
        return {
          name: "Unknown Token",
          symbol: "???",
          apy: 0,
          stakedAmount: 0,
          balance: 0,
          price: 0,
          iconUrl: "https://cdn-icons-png.flaticon.com/512/6404/6404078.png",
          lockPeriod: "Unknown",
          minStake: 0,
          earlyUnstakeFee: 0,
        };
    }
  };

  const token = getTokenData();
  
  const handleUnstake = () => {
    const amount = parseFloat(unstakeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    
    if (amount > token.stakedAmount) {
      Alert.alert("Error", "Insufficient staked balance");
      return;
    }
    
    // Show confirmation for early unstaking
    Alert.alert(
      "Confirm Unstake",
      `You are about to unstake ${amount} ${token.symbol}. An early unstaking fee of ${token.earlyUnstakeFee}% will be applied. Do you want to continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unstake",
          onPress: () => {
            setIsLoading(true);
            
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              
              // Navigate to success screen
              router.push({
                pathname: "/unstake-success",
                params: {
                  id: id as string,
                  amount: unstakeAmount,
                  symbol: token.symbol,
                  fee: (parseFloat(unstakeAmount) * (token.earlyUnstakeFee / 100)).toFixed(6),
                },
              });
            }, 1500);
          },
        },
      ]
    );
  };

  const handleMaxAmount = () => {
    setUnstakeAmount(token.stakedAmount.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unstake {token.symbol}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tokenHeader}>
          <Image source={{ uri: token.iconUrl }} style={styles.tokenIcon} />
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
            <View style={styles.apyContainer}>
              <TrendingUp size={16} color={theme.colors.primary} />
              <Text style={styles.apy}>{token.apy.toFixed(1)}% APY</Text>
            </View>
          </View>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Currently Staked</Text>
              <Text style={styles.statValue}>
                {token.stakedAmount.toFixed(token.stakedAmount < 1 ? 6 : 2)} {token.symbol}
              </Text>
              <Text style={styles.statSubvalue}>${(token.stakedAmount * token.price).toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.actionCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Unstake Amount</Text>
            <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={unstakeAmount}
              onChangeText={setUnstakeAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={styles.inputSymbol}>{token.symbol}</Text>
          </View>
          <Text style={styles.inputValue}>
            ≈ ${(parseFloat(unstakeAmount || "0") * token.price).toFixed(2)}
          </Text>

          <View style={styles.feeContainer}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Early Unstaking Fee ({token.earlyUnstakeFee}%)</Text>
              <Text style={styles.feeValue}>
                {(parseFloat(unstakeAmount || "0") * (token.earlyUnstakeFee / 100)).toFixed(6)} {token.symbol}
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>You Will Receive</Text>
              <Text style={styles.feeValue}>
                {(parseFloat(unstakeAmount || "0") * (1 - token.earlyUnstakeFee / 100)).toFixed(6)} {token.symbol}
              </Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>Lock period: {token.lockPeriod}</Text>
            </View>
            <View style={styles.infoRow}>
              <AlertCircle size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>
                Early unstaking incurs a {token.earlyUnstakeFee}% fee
              </Text>
            </View>
          </View>

          <Button
            title="Unstake Now"
            onPress={handleUnstake}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.actionButton}
            disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > token.stakedAmount}
          />
        </Card>

        <Card style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Info size={20} color={theme.colors.warning} />
            <Text style={styles.warningTitle}>Important Information</Text>
          </View>
          <Text style={styles.warningText}>
            Unstaking before the end of the lock period ({token.lockPeriod}) will result in an early unstaking fee of {token.earlyUnstakeFee}% of the unstaked amount.
          </Text>
          <Text style={styles.warningText}>
            You will stop earning rewards on the unstaked amount immediately after unstaking.
          </Text>
        </Card>
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
    paddingVertical: theme.spacing.lg,
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
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  tokenIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.lg,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  apyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  apy: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h4,
    fontWeight: "700",
    marginBottom: 2,
    color: theme.colors.text,
  },
  statSubvalue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  actionCard: {
    marginBottom: theme.spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  maxButton: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  maxButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.xs,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 18,
  },
  inputSymbol: {
    ...theme.typography.body,
    fontWeight: "600",
    marginRight: theme.spacing.md,
    color: theme.colors.text,
  },
  inputValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  feeContainer: {
    backgroundColor: "rgba(255, 204, 0, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  feeLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  feeValue: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    color: theme.colors.text,
  },
  infoContainer: {
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
  warningCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: "rgba(255, 204, 0, 0.05)",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  warningTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
    color: theme.colors.warning,
  },
  warningText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
});