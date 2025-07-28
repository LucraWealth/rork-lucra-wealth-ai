import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import Card from "@/components/Card";
import TokenIcon from "@/components/TokenIcon";
import { useWalletStore } from "@/store/walletStore";
import { ArrowLeft, ChevronRight, DollarSign, Wallet } from "lucide-react-native";

type Step = "amount" | "review" | "confirm";

export default function SellTokenScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tokens, sellToken } = useWalletStore();
  
  const [currentStep, setCurrentStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const token = tokens.find((t) => t.id === id);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [currentStep]);
  
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
  
  const calculateUsdValue = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "0.00";
    }
    return (amountValue * token.price).toFixed(2);
  };
  
  const handleNext = () => {
    if (currentStep === "amount") {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }
      
      if (amountValue > token.balance) {
        Alert.alert("Error", "Insufficient token balance");
        return;
      }
      
      setCurrentStep("review");
    } else if (currentStep === "review") {
      setCurrentStep("confirm");
    }
  };
  
  const handleBack = () => {
    if (currentStep === "review") {
      setCurrentStep("amount");
    } else if (currentStep === "confirm") {
      setCurrentStep("review");
    } else {
      router.back();
    }
  };
  
  const handleSell = () => {
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    
    if (amountValue > token.balance) {
      Alert.alert("Error", "Insufficient token balance");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        sellToken(token.id, amountValue);
        
        router.push({
          pathname: "/sell-success",
          params: {
            tokenId: token.id,
            tokenSymbol: token.symbol,
            amount: amount,
            value: calculateUsdValue(),
          },
        });
      } catch (error) {
        Alert.alert("Error", "Failed to sell token");
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleMaxAmount = () => {
    setAmount(token.balance.toString());
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "amount":
        return `Sell ${token.symbol}`;
      case "review":
        return "Review Order";
      case "confirm":
        return "Confirm Sale";
      default:
        return `Sell ${token.symbol}`;
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep === "amount" && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep === "amount" && styles.activeStepText]}>1</Text>
        </View>
        <Text style={styles.stepLabel}>Amount</Text>
      </View>
      
      <View style={styles.stepLine} />
      
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep === "review" && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep === "review" && styles.activeStepText]}>2</Text>
        </View>
        <Text style={styles.stepLabel}>Review</Text>
      </View>
      
      <View style={styles.stepLine} />
      
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep === "confirm" && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep === "confirm" && styles.activeStepText]}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Confirm</Text>
      </View>
    </View>
  );

  const renderAmountStep = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.tokenInfo}>
        <TokenIcon 
          symbol={token.symbol} 
          iconUrl={token.iconUrl} 
          size={50} 
        />
        <View style={styles.tokenInfoText}>
          <Text style={styles.tokenName}>{token.name}</Text>
          <Text style={styles.tokenPrice}>${token.price.toFixed(2)}</Text>
        </View>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>
          {token.balance.toFixed(token.balance < 1 ? 6 : 2)} {token.symbol}
        </Text>
        <Text style={styles.balanceUsd}>
          ≈ ${(token.balance * token.price).toFixed(2)}
        </Text>
      </Card>

      <Card style={styles.amountCard}>
        <View style={styles.amountHeader}>
          <Text style={styles.amountLabel}>Amount to Sell</Text>
          <TouchableOpacity 
            style={styles.maxButton}
            onPress={handleMaxAmount}
          >
            <Text style={styles.maxButtonText}>MAX</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.amountInputContainer}>
          <TextInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            containerStyle={styles.amountInput}
            inputStyle={styles.amountInputText}
          />
          <Text style={styles.amountSymbol}>{token.symbol}</Text>
        </View>
        
        <View style={styles.conversionContainer}>
          <Text style={styles.conversionText}>
            ≈ ${calculateUsdValue()}
          </Text>
        </View>
      </Card>

      <View style={styles.quickAmounts}>
        <Text style={styles.quickAmountsLabel}>Quick amounts</Text>
        <View style={styles.quickAmountsRow}>
          {[0.25, 0.5, 0.75, 1].map((fraction) => {
            const quickAmount = (token.balance * fraction).toFixed(
              token.balance < 1 ? 6 : 2
            );
            return (
              <TouchableOpacity
                key={fraction.toString()}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount)}
              >
                <Text style={styles.quickAmountText}>{fraction * 100}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );

  const renderReviewStep = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Token</Text>
          <View style={styles.summaryTokenValue}>
            <TokenIcon 
              symbol={token.symbol} 
              iconUrl={token.iconUrl} 
              size={24} 
            />
            <Text style={styles.summaryValue}>{token.name} ({token.symbol})</Text>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sell Amount</Text>
          <Text style={styles.summaryValue}>
            {amount || "0"} {token.symbol}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>
            ${token.price.toFixed(2)} per {token.symbol}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fee</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>You Receive</Text>
          <Text style={styles.totalValue}>
            ${calculateUsdValue()}
          </Text>
        </View>
      </Card>

      <Card style={styles.paymentCard}>
        <Text style={styles.paymentLabel}>Funds will be added to</Text>
        
        <View style={styles.paymentOption}>
          <View style={styles.paymentOptionIcon}>
            <Wallet size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.paymentOptionInfo}>
            <Text style={styles.paymentOptionTitle}>Wallet Balance</Text>
            <Text style={styles.paymentOptionSubtitle}>
              Current balance: ${useWalletStore.getState().balance.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderConfirmStep = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.confirmContainer}>
        <View style={styles.confirmIconContainer}>
          <DollarSign size={40} color={theme.colors.primary} />
        </View>
        
        <Text style={styles.confirmTitle}>Ready to Sell</Text>
        
        <Text style={styles.confirmDescription}>
          You are about to sell {amount} {token.symbol} for ${calculateUsdValue()}.
          This transaction cannot be reversed once processed.
        </Text>
        
        <Card style={styles.confirmDetailsCard}>
          <View style={styles.confirmDetailsRow}>
            <Text style={styles.confirmDetailsLabel}>Token</Text>
            <View style={styles.confirmTokenValue}>
              <TokenIcon 
                symbol={token.symbol} 
                iconUrl={token.iconUrl} 
                size={20} 
              />
              <Text style={styles.confirmDetailsValue}>{token.symbol}</Text>
            </View>
          </View>
          
          <View style={styles.confirmDetailsRow}>
            <Text style={styles.confirmDetailsLabel}>Amount</Text>
            <Text style={styles.confirmDetailsValue}>{amount} {token.symbol}</Text>
          </View>
          
          <View style={styles.confirmDetailsRow}>
            <Text style={styles.confirmDetailsLabel}>Value</Text>
            <Text style={styles.confirmDetailsValue}>${calculateUsdValue()}</Text>
          </View>
        </Card>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getStepTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderStepIndicator()}

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === "amount" && renderAmountStep()}
          {currentStep === "review" && renderReviewStep()}
          {currentStep === "confirm" && renderConfirmStep()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep === "confirm" ? (
            <Button
              title={`Sell ${token.symbol}`}
              onPress={handleSell}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > token.balance}
            />
          ) : (
            <Button
              title="Continue"
              onPress={handleNext}
              variant="primary"
              size="large"
              disabled={currentStep === "amount" && (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > token.balance)}
              icon={<ChevronRight size={20} color="#121212" />}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
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
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  activeStepText: {
    color: "#121212",
  },
  stepLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  tokenInfoText: {
    marginLeft: theme.spacing.md,
  },
  tokenName: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  tokenPrice: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  balanceCard: {
    marginBottom: theme.spacing.lg,
  },
  balanceLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    ...theme.typography.h3,
    fontWeight: "700",
    marginBottom: 2,
    color: theme.colors.text,
  },
  balanceUsd: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  amountCard: {
    marginBottom: theme.spacing.lg,
  },
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  amountLabel: {
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  amountInputText: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text,
  },
  amountSymbol: {
    ...theme.typography.body,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  conversionContainer: {
    marginTop: theme.spacing.sm,
  },
  conversionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  quickAmounts: {
    marginBottom: theme.spacing.lg,
  },
  quickAmountsLabel: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  quickAmountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginHorizontal: 4,
  },
  quickAmountText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: "500",
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  summaryTokenValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  totalLabel: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  totalValue: {
    ...theme.typography.h4,
    fontWeight: "700",
    color: theme.colors.text,
  },
  paymentCard: {
    marginBottom: theme.spacing.lg,
  },
  paymentLabel: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  paymentOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    ...theme.typography.body,
    fontWeight: "500",
    color: theme.colors.text,
  },
  paymentOptionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  confirmContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  confirmTitle: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  confirmDescription: {
    ...theme.typography.body,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  confirmDetailsCard: {
    width: "100%",
  },
  confirmDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  confirmDetailsLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  confirmDetailsValue: {
    ...theme.typography.body,
    fontWeight: "500",
    color: theme.colors.text,
  },
  confirmTokenValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 16,
    marginBottom: 16,
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