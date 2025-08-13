import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { useWalletStore } from "@/store/walletStore";
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  ChevronRight,
  Shield,
  Zap,
  Plus,
  Check
} from "lucide-react-native";

const { width } = Dimensions.get('window');
type Step = "amount" | "payment" | "review";

export default function BuyTokenScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tokens, balance } = useWalletStore();
  
  const [currentStep, setCurrentStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [paymentMethodAnim] = useState(new Animated.Value(0));
  
  const token = tokens.find((t) => t.id === id);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  }, []);

  useEffect(() => {
    if (currentStep === "payment") {
      Animated.timing(paymentMethodAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
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
  
  const calculateTokenAmount = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "0";
    }
    return (amountValue / token.price).toFixed(6);
  };
  
  const handleNext = () => {
    if (currentStep === "amount") {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("review");
    }
  };
  
  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("amount");
    } else if (currentStep === "review") {
      setCurrentStep("payment");
    } else {
      router.back();
    }
  };
  
  const handleConfirmPurchase = () => {
    const amountValue = parseFloat(amount);
    
    if (paymentMethod === "wallet" && amountValue > balance) {
      Alert.alert("Error", "Insufficient wallet balance");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        useWalletStore.getState().buyToken(token.id, amountValue);
        
        router.push({
          pathname: "/buy-success",
          params: {
            tokenId: token.id,
            tokenSymbol: token.symbol,
            amount: calculateTokenAmount(),
            value: amount,
          },
        });
      } catch (error) {
        Alert.alert("Error", "Failed to buy token");
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "amount":
        return `Buy ${token.symbol}`;
      case "payment":
        return "Payment Method";
      case "review":
        return "Review Order";
      default:
        return `Buy ${token.symbol}`;
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
        <View style={[styles.stepCircle, currentStep === "payment" && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep === "payment" && styles.activeStepText]}>2</Text>
        </View>
        <Text style={styles.stepLabel}>Payment</Text>
      </View>
      
      <View style={styles.stepLine} />
      
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep === "review" && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep === "review" && styles.activeStepText]}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Review</Text>
      </View>
    </View>
  );

  const renderAmountStep = () => (
    <Animated.View style={{ 
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      <View style={styles.tokenInfo}>
        <View>
          <Text style={styles.tokenName}>{token.name}</Text>
          <Text style={styles.tokenPrice}>${token.price.toFixed(2)}</Text>
        </View>
      </View>

      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Buy (USD)</Text>
        <TextInput
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          containerStyle={styles.amountInput}
          inputStyle={styles.amountInputText}
        />
        <View style={styles.conversionContainer}>
          <Text style={styles.conversionText}>
            ≈ {calculateTokenAmount()} {token.symbol}
          </Text>
        </View>
      </Card>


      <View style={styles.quickAmounts}>
        <Text style={styles.quickAmountsLabel}>Quick amounts</Text>
        <View style={styles.quickAmountsRow}>
          {["25", "50", "100", "250"].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount)}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderPaymentStep = () => (
    <Animated.View style={{ 
      opacity: paymentMethodAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      {/* Header Section */}
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentTitle}>Choose your payment method</Text>
        <Text style={styles.paymentSubtitle}>
          All transactions are secure and encrypted
        </Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.paymentMethodsContainer}>
        
        {/* Wallet Balance Option */}
        <Animated.View style={[
          styles.paymentMethodCard,
          paymentMethod === "wallet" && styles.selectedPaymentCard
        ]}>
          <TouchableOpacity
            style={styles.paymentMethodContent}
            onPress={() => setPaymentMethod("wallet")}
            activeOpacity={0.7}
          >
            {/* Left Section */}
            <View style={styles.paymentMethodLeft}>
              <View style={[
                styles.paymentIconContainer,
                { backgroundColor: 'rgba(74, 227, 168, 0.15)' }
              ]}>
                <Wallet size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodHeader}>
                  <Text style={styles.paymentMethodTitle}>Wallet Balance</Text>
                  <View style={styles.instantBadge}>
                    <Zap size={12} color="#FFA500" />
                    <Text style={styles.instantText}>Instant</Text>
                  </View>
                </View>
                <Text style={styles.paymentMethodBalance}>
                  ${balance.toFixed(2)} available
                </Text>
                <Text style={styles.paymentMethodDescription}>
                  Pay directly from your wallet balance
                </Text>
              </View>
            </View>

            {/* Right Section */}
            <View style={styles.paymentMethodRight}>
              <View style={[
                styles.radioButton,
                paymentMethod === "wallet" && styles.radioButtonSelected
              ]}>
                {paymentMethod === "wallet" && (
                  <Check size={14} color="#121212" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Selection Indicator */}
          {paymentMethod === "wallet" && (
            <View style={styles.selectionIndicator} />
          )}
        </Animated.View>

        {/* Credit Card Option */}
        <Animated.View style={[
          styles.paymentMethodCard,
          paymentMethod === "card" && styles.selectedPaymentCard
        ]}>
          <TouchableOpacity
            style={styles.paymentMethodContent}
            onPress={() => setPaymentMethod("card")}
            activeOpacity={0.7}
          >
            {/* Left Section */}
            <View style={styles.paymentMethodLeft}>
              <View style={[
                styles.paymentIconContainer,
                { backgroundColor: 'rgba(59, 130, 246, 0.15)' }
              ]}>
                <CreditCard size={24} color="#3B82F6" />
              </View>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodHeader}>
                  <Text style={styles.paymentMethodTitle}>Credit Card</Text>
                  <View style={styles.secureBadge}>
                    <Shield size={12} color="#10B981" />
                    <Text style={styles.secureText}>Secure</Text>
                  </View>
                </View>
                <Text style={styles.paymentMethodCardNumber}>
                  Visa •••• 4242
                </Text>
                <Text style={styles.paymentMethodDescription}>
                  Pay with your saved credit card
                </Text>
              </View>
            </View>

            {/* Right Section */}
            <View style={styles.paymentMethodRight}>
              <View style={[
                styles.radioButton,
                paymentMethod === "card" && styles.radioButtonSelected
              ]}>
                {paymentMethod === "card" && (
                  <Check size={14} color="#121212" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Selection Indicator */}
          {paymentMethod === "card" && (
            <View style={styles.selectionIndicator} />
          )}
        </Animated.View>

      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Shield size={16} color={theme.colors.primary} />
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure
        </Text>
      </View>
    </Animated.View>
  );

  const renderReviewStep = () => (
    <Animated.View style={{ 
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Token</Text>
          <Text style={styles.summaryValue}>{token.name} ({token.symbol})</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>
            {calculateTokenAmount()} {token.symbol}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>
            ${token.price.toFixed(2)} per {token.symbol}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>
            {paymentMethod === "wallet" ? "Wallet Balance" : "Credit Card"}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fee</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
          </Text>
        </View>
      </Card>
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

        <View 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep === "amount" && renderAmountStep()}
          {currentStep === "payment" && renderPaymentStep()}
          {currentStep === "review" && renderReviewStep()}
        </View>

        <View style={styles.footer}>
          {currentStep === "review" ? (
            <Button
              title={`Buy ${token.symbol}`}
              onPress={handleConfirmPurchase}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0}
            />
          ) : (
            <Button
              title="Continue"
              onPress={handleNext}
              variant="primary"
              size="large"
              disabled={currentStep === "amount" && (!amount || parseFloat(amount) <= 0)}
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
    paddingHorizontal: theme.spacing.xl,
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
  tokenName: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  tokenPrice: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  amountCard: {
    marginBottom: theme.spacing.lg,
  },
  amountLabel: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  amountInput: {
    marginBottom: 0,
  },
  amountInputText: {
    fontSize: 24,
    fontWeight: "600",
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
  
  // Enhanced Payment Step Styles
  paymentHeader: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  paymentTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  paymentSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  paymentMethodsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  paymentMethodCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPaymentCard: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(74, 227, 168, 0.03)',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  paymentMethodLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodTitle: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  instantText: {
    ...theme.typography.caption,
    color: '#FFA500',
    fontWeight: '600',
    fontSize: 10,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  secureText: {
    ...theme.typography.caption,
    color: '#10B981',
    fontWeight: '600',
    fontSize: 10,
  },
  paymentMethodBalance: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentMethodCardNumber: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  paymentMethodRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 227, 168, 0.05)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 227, 168, 0.2)',
    borderStyle: 'dashed',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  addPaymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 227, 168, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  addPaymentText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 227, 168, 0.08)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  securityText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  // Review Step Styles (keeping original)
  summaryCard: {
    marginBottom: theme.spacing.xl,
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