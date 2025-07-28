import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { ArrowLeft, Wallet, CreditCard, Building, Check, AlertCircle } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function RedeemCashbackMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cashback, redeemCashback, error, clearError } = useWalletStore();
  
  const amount = parseFloat(params.amount as string || "0");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
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
    
    // Clear any previous errors
    clearError();
  }, []);
  
  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };
  
  const handleRedeem = () => {
    if (!selectedMethod) return;
    
    try {
      // Check if redeemCashback exists
      if (typeof redeemCashback !== 'function') {
        Alert.alert(
          "Error",
          "This feature is currently unavailable. Please try again later."
        );
        return;
      }
      
      redeemCashback(amount, selectedMethod);
      
      if (!error) {
        router.push("/redeem-cashback-success");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "An error occurred while processing your request. Please try again later."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redemption Method</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.amountContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Choose Redemption Method</Text>
          
          <View style={styles.amountInfo}>
            <Text style={styles.amountLabel}>Amount to Redeem</Text>
            <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <View style={styles.methodsContainer}>
            <TouchableOpacity 
              style={[
                styles.methodCard,
                selectedMethod === "wallet" && styles.methodCardSelected
              ]}
              onPress={() => handleMethodSelect("wallet")}
            >
              <View style={styles.methodIconContainer}>
                <Wallet size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Wallet Balance</Text>
                <Text style={styles.methodDescription}>
                  Add to your wallet balance
                </Text>
              </View>
              {selectedMethod === "wallet" && (
                <View style={styles.checkContainer}>
                  <Check size={20} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
            
            {/* <TouchableOpacity 
              style={[
                styles.methodCard,
                selectedMethod === "token" && styles.methodCardSelected
              ]}
              onPress={() => handleMethodSelect("token")}
            >
              <View style={styles.methodIconContainer}>
                <CreditCard size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>LCRA Tokens</Text>
                <Text style={styles.methodDescription}>
                  Convert to LCRA tokens (+5% bonus)
                </Text>
              </View>
              {selectedMethod === "token" && (
                <View style={styles.checkContainer}>
                  <Check size={20} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity> */}
            
            <TouchableOpacity 
              style={[
                styles.methodCard,
                selectedMethod === "bank" && styles.methodCardSelected
              ]}
              onPress={() => handleMethodSelect("bank")}
            >
              <View style={styles.methodIconContainer}>
                <Building size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Bank Account</Text>
                <Text style={styles.methodDescription}>
                  Transfer to your linked bank account
                </Text>
              </View>
              {selectedMethod === "bank" && (
                <View style={styles.checkContainer}>
                  <Check size={20} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {selectedMethod === "wallet" 
                ? "Funds will be immediately available in your wallet balance."
                : selectedMethod === "token"
                ? "Tokens will be credited to your account with a 5% bonus."
                : selectedMethod === "bank"
                ? "Bank transfers typically take 1-3 business days to process."
                : "Select a redemption method to continue."}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.redeemButton,
            !selectedMethod && styles.redeemButtonDisabled
          ]}
          onPress={handleRedeem}
          disabled={!selectedMethod}
        >
          <Text style={styles.redeemButtonText}>Redeem Cashback</Text>
        </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
  },
  amountContainer: {
    marginTop: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  amountInfo: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  amountLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  methodsContainer: {
    marginBottom: theme.spacing.lg,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  methodCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: 2,
  },
  methodDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(74, 227, 168, 0.2)",
    alignItems: "center",
    justifyContent: "center",
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
  redeemButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemButtonDisabled: {
    backgroundColor: "rgba(74, 227, 168, 0.3)",
  },
  redeemButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.background,
    fontWeight: "600",
  },
});