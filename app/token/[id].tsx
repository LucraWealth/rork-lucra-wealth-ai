import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useWalletStore } from "@/store/walletStore";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react-native";
import { TokenIcon } from "@/components/TokenIcon"; // ✅ Make sure this import is correct

export default function TokenDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tokens } = useWalletStore();

  const token = tokens.find((t) => t.id === id);

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Token not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = token.change >= 0;
  const tokenValue = token.balance * token.price;

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
        <View style={styles.tokenHeader}>
          <TokenIcon symbol={token.symbol} size={60} style={styles.tokenIcon} />
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.tokenPrice}>${token.price.toFixed(2)}</Text>
              <View style={styles.changeContainer}>
                {isPositive ? (
                  <TrendingUp size={16} color={theme.colors.success} />
                ) : (
                  <TrendingDown size={16} color={theme.colors.error} />
                )}
                <Text
                  style={[
                    styles.changeText,
                    isPositive ? styles.positiveChange : styles.negativeChange,
                  ]}
                >
                  {isPositive ? "+" : ""}
                  {token.change.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>
            {token.balance.toFixed(6)} {token.symbol}
          </Text>
          <Text style={styles.balanceValue}>${tokenValue.toFixed(2)}</Text>
        </Card>

        {token.description && (
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>About {token.name}</Text>
            <Text style={styles.descriptionText}>{token.description}</Text>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="Buy"
            onPress={() => router.push(`/buy-token/${token.id}`)}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="Sell"
            onPress={() => router.push(`/sell-token/${token.id}`)}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Swap"
            onPress={() =>
              router.push({
                pathname: "/token-swap",
                params: { fromTokenId: token.id },
              })
            }
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
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
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenPrice: {
    ...theme.typography.h4,
    marginRight: theme.spacing.md,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    ...theme.typography.body,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  positiveChange: {
    color: theme.colors.success,
  },
  negativeChange: {
    color: theme.colors.error,
  },
  balanceCard: {
    marginBottom: theme.spacing.lg,
  },
  balanceLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    ...theme.typography.h3,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  balanceValue: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  descriptionCard: {
    marginBottom: theme.spacing.lg,
  },
  descriptionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
  },
  descriptionText: {
    ...theme.typography.body,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: theme.spacing.xxl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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
