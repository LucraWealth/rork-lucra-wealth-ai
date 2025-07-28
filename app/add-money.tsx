import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { ArrowLeft, CreditCard, Landmark, AlertCircle } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";

export default function AddMoneyScreen() {
  const router = useRouter();
  const { depositMoney, error, clearError } = useWalletStore();
  const { paymentMethods } = usePaymentMethodsStore();
  
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Screen entry animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const defaultPaymentMethod = paymentMethods.find(method => method.isDefault);
  
  const handleAmountChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const parts = filtered.split(".");
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      return;
    }
    
    setAmount(filtered);
  };
  
  const handleAddMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    
    if (!selectedMethod && paymentMethods.length === 0) {
      Alert.alert("Error", "Please add a payment method first");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        depositMoney(parseFloat(amount), "Added from payment method");
        setIsLoading(false);
        
        // Navigate to success screen
        router.push({
          pathname: "/add-money-success",
          params: { amount }
        });
      } catch (error) {
        setIsLoading(false);
        Alert.alert("Error", error instanceof Error ? error.message : "An error occurred");
      }
    }, 1500);
  };
  
  const renderPaymentMethods = () => {
    if (paymentMethods.length === 0) {
      return (
        <Card style={styles.emptyMethodsCard}>
          <AlertCircle size={24} color={theme.colors.warning} />
          <Text style={styles.emptyMethodsText}>No payment methods found</Text>
          <Button
            title="Add Payment Method"
            onPress={() => router.push("/add-payment-method")}
            variant="outline"
            size="small"
            style={styles.addMethodButton}
          />
        </Card>
      );
    }
    
    return (
      <View style={styles.methodsContainer}>
        <Text style={styles.methodsTitle}>Select Payment Method</Text>
        
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethodCard
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.methodIcon}>
              <CreditCard size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>
                {method.type} •••• {method.lastFour}
              </Text>
              <Text style={styles.methodDetails}>{method.name}</Text>
            </View>
            <View style={styles.methodRadio}>
              {selectedMethod === method.id && (
                <View style={styles.methodRadioSelected} />
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => setSelectedMethod("paypal")}
        >
          <View style={styles.methodIcon}>
            <CreditCard size={20} color="#0070BA" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>PayPal</Text>
            <Text style={styles.methodDetails}>Connect your PayPal account</Text>
          </View>
          <View style={styles.methodRadio}>
            {selectedMethod === "paypal" && (
              <View style={styles.methodRadioSelected} />
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => setSelectedMethod("interac")}
        >
          <View style={styles.methodIcon}>
            <Landmark size={20} color="#F6821F" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Interac e-Transfer</Text>
            <Text style={styles.methodDetails}>Send from your bank account</Text>
          </View>
          <View style={styles.methodRadio}>
            {selectedMethod === "interac" && (
              <View style={styles.methodRadioSelected} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Money</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Enter Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <RNTextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                />
              </View>
            </View>
            
            {renderPaymentMethods()}
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <Button
              title="Add Money"
              onPress={handleAddMoney}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0 || (!selectedMethod && paymentMethods.length > 0)}
              style={styles.addButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
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
    paddingBottom: theme.spacing.xxl,
  },
  amountContainer: {
    marginBottom: theme.spacing.xl,
  },
  amountLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingBottom: theme.spacing.sm,
  },
  currencySymbol: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  amountInput: {
    ...theme.typography.h1,
    color: theme.colors.text,
    flex: 1,
    padding: 0,
  },
  methodsContainer: {
    marginBottom: theme.spacing.xl,
  },
  methodsTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  selectedMethodCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...theme.typography.body,
    fontWeight: "500",
  },
  methodDetails: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  methodRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  emptyMethodsCard: {
    alignItems: "center",
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  emptyMethodsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
  },
  addMethodButton: {
    marginTop: theme.spacing.sm,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
});