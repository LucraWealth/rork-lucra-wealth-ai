import React, { useState, useRef, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Animated, 
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";
import { 
  ArrowLeft, 
  AlertCircle, 
  Gift, 
  CreditCard, 
  CheckCircle2,
  Shield,
  Clock,
  Calendar
} from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function BillPaymentConfirmScreen() {
  const router = useRouter();
  const { billId, amount, billName, category, logoUrl } = useLocalSearchParams();
  const { payBill } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Start animations
  React.useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  }, []);
  
  const amountValue = parseFloat(amount as string);
  const cashbackAmount = amountValue * 0.05; // 5% cashback
  
  const handleConfirmPayment = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update bill status and pay bill
      payBill(billId as string, amountValue, category as string);
      
      setIsLoading(false);
      
      router.push({
        pathname: "/payment-success",
        params: { amount: amount as string, billName: billName as string }
      });
    }, 1500);
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.billContainer}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: logoUrl as string }} 
                style={styles.billLogo}
                defaultSource={{ uri: "https://via.placeholder.com/80" }}
              />
            </View>
            <Text style={styles.billName}>{billName}</Text>
            <Text style={styles.billCategory}>{category}</Text>
            <Text style={styles.billAmount}>${amountValue.toFixed(2)}</Text>
            
            <View style={styles.dueContainer}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={styles.dueText}>Due Today</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoHeader}>
              <AlertCircle size={20} color={theme.colors.warning} />
              <Text style={styles.infoTitle}>Payment Information</Text>
            </View>
            <Text style={styles.infoText}>
              You are about to pay ${amountValue.toFixed(2)} to {billName}. This payment cannot be reversed once processed.
            </Text>
            <View style={styles.cashbackInfo}>
              <Gift size={16} color={theme.colors.primary} />
              <Text style={styles.cashbackText}>
                You will earn ${cashbackAmount.toFixed(2)} in cashback rewards for this payment.
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentMethodContainer}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentCardLeft}>
                <View style={styles.paymentCardIcon}>
                  <CreditCard size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.paymentCardTitle}>Visa •••• 4242</Text>
                  <Text style={styles.paymentCardSubtitle}>Expires 12/25</Text>
                </View>
              </View>
              <View style={styles.paymentCardBadge}>
                <Text style={styles.paymentCardBadgeText}>Default</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bill Amount</Text>
                <Text style={styles.detailValue}>${amountValue.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Processing Fee</Text>
                <Text style={styles.detailValue}>$0.00</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={styles.detailValueTotal}>${amountValue.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cashback Reward</Text>
                <Text style={styles.cashbackValue}>+${cashbackAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.securityContainer}>
            <View style={styles.securityIcon}>
              <Shield size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.securityText}>
              Your payment is secure and encrypted. Your card details are never stored on our servers.
            </Text>
          </View>
          
          <View style={styles.processingTimeContainer}>
            <View style={styles.processingTimeIcon}>
              <Clock size={20} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.processingTimeText}>
              Processing time: Payments are typically processed within 1-2 business days.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.footer,
          { opacity: fadeAnim }
        ]}
      >
        {/* Always use vertical layout for buttons to prevent truncation */}
        <View style={styles.buttonColumn}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            size="large"
            style={styles.fullWidthButton}
          />
          <Button
            title="Confirm Payment"
            onPress={handleConfirmPayment}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.fullWidthButton}
            leftIcon={!isLoading ? <CheckCircle2 size={20} color={theme.colors.background} /> : undefined}
          />
        </View>
      </Animated.View>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  billContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: "rgba(74, 227, 168, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  billLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  billName: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  billCategory: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  billAmount: {
    ...theme.typography.h1,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  dueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  dueText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: 6,
    fontWeight: "500",
  },
  infoContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.2)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  cashbackInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  cashbackText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  paymentMethodContainer: {
    marginBottom: theme.spacing.xl,
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  paymentCardTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  paymentCardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  paymentCardBadge: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  paymentCardBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  detailsContainer: {
    marginBottom: theme.spacing.xl,
  },
  detailCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  detailValueTotal: {
    ...theme.typography.h4,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cashbackValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  securityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  securityText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  processingTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  processingTimeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  processingTimeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonColumn: {
    flexDirection: "column",
    gap: theme.spacing.md,
  },
  fullWidthButton: {
    width: "100%",
  },
});