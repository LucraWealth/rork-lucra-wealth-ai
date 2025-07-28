import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  InputAccessoryView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { ArrowLeft, DollarSign } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function RedeemCashbackAmountScreen() {
  const router = useRouter();
  const { cashback } = useWalletStore();
  
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Input accessory view ID for iOS
  const inputAccessoryViewID = "doneButtonAccessoryViewID";
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Add keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
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
    setError(null);
  };
  
  const handleContinue = () => {
    const amountValue = parseFloat(amount);
    
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (amountValue > cashback) {
      setError("Amount exceeds available cashback");
      return;
    }
    
    router.push({
      pathname: "/redeem-cashback-method",
      params: { amount }
    });
  };
  
  const handleMaxAmount = () => {
    setAmount(cashback.toString());
    setError(null);
  };
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem Cashback</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Animated.View 
            style={[
              styles.content,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>Enter Amount</Text>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Cashback</Text>
              <Text style={styles.balanceAmount}>${cashback.toFixed(2)}</Text>
            </View>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={dismissKeyboard}
                inputAccessoryViewID={Platform.OS === "ios" ? inputAccessoryViewID : undefined}
              />
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <TouchableOpacity 
              style={styles.maxButton}
              onPress={handleMaxAmount}
            >
              <Text style={styles.maxButtonText}>Use Max Amount</Text>
            </TouchableOpacity>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                You can redeem your cashback for wallet balance, LCRA tokens, or transfer to your bank account.
              </Text>
            </View>
          </Animated.View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > cashback) && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > cashback}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        
        {/* Input Accessory View for iOS */}
        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={styles.inputAccessoryView}>
              <TouchableOpacity 
                style={styles.doneButton} 
                onPress={dismissKeyboard}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
        
        {/* Custom Done button for Android */}
        {Platform.OS === "android" && keyboardVisible && (
          <TouchableOpacity
            style={styles.androidDoneButton}
            onPress={dismissKeyboard}
            activeOpacity={0.7}
          >
            <Text style={styles.androidDoneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  balanceLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  maxButton: {
    alignSelf: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  maxButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "rgba(74, 227, 168, 0.3)",
  },
  continueButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.background,
    fontWeight: "600",
  },
  inputAccessoryView: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#212121",
    paddingHorizontal: theme.spacing.md,
    height: 45,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  doneButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  doneButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  // Android custom done button
  androidDoneButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  androidDoneButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.background,
    fontWeight: "600",
  },
});