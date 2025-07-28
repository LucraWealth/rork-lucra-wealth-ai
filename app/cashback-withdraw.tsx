import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useWalletStore } from "@/store/walletStore";
import { ArrowLeft, TrendingUp, Wallet, ArrowRight } from "lucide-react-native";

export default function CashbackWithdrawScreen() {
  const router = useRouter();
  const { cashback, withdrawCashback } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleWithdraw = () => {
    if (cashback <= 0) {
      Alert.alert("Error", "No cashback available to withdraw");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        withdrawCashback();
        setIsLoading(false);
        router.push("/cashback-success");
      } catch (error) {
        setIsLoading(false);
        Alert.alert("Error", "Failed to withdraw cashback. Please try again.");
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Cashback</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <Card style={styles.cashbackCard}>
          <View style={styles.cashbackIconContainer}>
            <TrendingUp size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.cashbackTitle}>Available Cashback</Text>
          <Text style={styles.cashbackAmount}>${cashback.toFixed(2)}</Text>
          <Text style={styles.cashbackDescription}>
            Withdraw your cashback rewards to your wallet balance
          </Text>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <TrendingUp size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Earn Cashback</Text>
              <Text style={styles.infoItemDescription}>
                Earn cashback on eligible transactions and bill payments
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <ArrowRight size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Withdraw Anytime</Text>
              <Text style={styles.infoItemDescription}>
                Withdraw your cashback to your wallet balance whenever you want
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Wallet size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Use Your Balance</Text>
              <Text style={styles.infoItemDescription}>
                Use your wallet balance for transactions, bill payments, or token purchases
              </Text>
            </View>
          </View>
        </Card>
        
        <Button
          title={isLoading ? "Processing..." : "Withdraw to Wallet"}
          onPress={handleWithdraw}
          variant="primary"
          size="large"
          disabled={cashback <= 0 || isLoading}
          loading={isLoading}
          style={styles.withdrawButton}
        />
        
        <Button
          title="Back to Cashback"
          onPress={() => router.push("/cashback")}
          variant="text"
          style={styles.backToButton}
        />
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
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  cashbackCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  cashbackIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  cashbackTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  cashbackAmount: {
    ...theme.typography.h1,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  cashbackDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  infoCard: {
    marginBottom: theme.spacing.xl,
  },
  infoTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: 2,
    color: theme.colors.text,
  },
  infoItemDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  withdrawButton: {
    marginBottom: theme.spacing.md,
  },
  backToButton: {
    marginBottom: theme.spacing.xxl,
  },
});