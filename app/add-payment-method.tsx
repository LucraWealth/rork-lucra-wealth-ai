import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import { ArrowLeft, CreditCard, User, Calendar, Lock } from "lucide-react-native";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const { addPaymentMethod } = usePaymentMethodsStore();
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Limit to 16 digits
    const limited = cleaned.substring(0, 16);
    // Add spaces after every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted;
  };
  
  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Limit to 4 digits
    const limited = cleaned.substring(0, 4);
    // Add slash after first 2 digits
    if (limited.length > 2) {
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    }
    return limited;
  };
  
  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };
  
  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };
  
  const validateCardNumber = () => {
    const cleaned = cardNumber.replace(/\s/g, "");
    return cleaned.length === 16;
  };
  
  const validateExpiryDate = () => {
    if (expiryDate.length !== 5) return false;
    
    const [month, year] = expiryDate.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);
    
    if (expiryMonth < 1 || expiryMonth > 12) return false;
    
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    
    return true;
  };
  
  const validateCvv = () => {
    return cvv.length === 3 || cvv.length === 4;
  };
  
  const handleSave = () => {
    // Validate inputs
    if (!cardholderName.trim()) {
      Alert.alert("Error", "Please enter the cardholder name");
      return;
    }
    
    if (!validateCardNumber()) {
      Alert.alert("Error", "Please enter a valid card number");
      return;
    }
    
    if (!validateExpiryDate()) {
      Alert.alert("Error", "Please enter a valid expiry date (MM/YY)");
      return;
    }
    
    if (!validateCvv()) {
      Alert.alert("Error", "Please enter a valid CVV");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Determine card type based on first digit
      const firstDigit = cardNumber.replace(/\s/g, "")[0];
      let cardType = "visa";
      
      if (firstDigit === "4") {
        cardType = "visa";
      } else if (firstDigit === "5") {
        cardType = "mastercard";
      } else if (firstDigit === "3") {
        cardType = "amex";
      }
      
      // Add payment method
      addPaymentMethod({
        name: cardholderName,
        lastFour: cardNumber.replace(/\s/g, "").slice(-4),
        expiry: expiryDate,
        type: cardType,
        isDefault,
      });
      
      setIsLoading(false);
      
      // Show success message
      Alert.alert(
        "Success",
        "Your payment method has been added",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Payment Method</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Information</Text>
            <Text style={styles.sectionDescription}>
              Enter your card details
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <CreditCard size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              label="Cardholder Name"
              placeholder="John Doe"
              value={cardholderName}
              onChangeText={setCardholderName}
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.md }]}>
              <View style={styles.inputIcon}>
                <Calendar size={20} color={theme.colors.primary} />
              </View>
              <TextInput
                label="Expiry Date"
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
                containerStyle={styles.input}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={theme.colors.primary} />
              </View>
              <TextInput
                label="CVV"
                placeholder="123"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                containerStyle={styles.input}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkboxInner, isDefault && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Set as default payment method</Text>
          </View>

          <Button
            title="Add Card"
            onPress={handleSave}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.saveButton}
          />
        </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    ...theme.typography.body,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});