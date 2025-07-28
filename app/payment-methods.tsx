import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { Plus, CreditCard, Trash2, Edit, CheckCircle, ArrowLeft } from "lucide-react-native";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { paymentMethods, setDefaultMethod, removePaymentMethod } = usePaymentMethodsStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddPaymentMethod = () => {
    router.push("/add-payment-method");
  };

  const handleEditPaymentMethod = (id: string) => {
    router.push({
      pathname: "/edit-payment-method",
      params: { id },
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultMethod(id);
    Alert.alert("Success", "Default payment method updated");
  };

  const handleRemovePaymentMethod = (id: string) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            // Simulate API call
            setTimeout(() => {
              removePaymentMethod(id);
              setIsDeleting(false);
            }, 500);
          },
        },
      ]
    );
  };

  const getCardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "visa":
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png";
      case "mastercard":
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png";
      case "amex":
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png";
      default:
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <Text style={styles.sectionDescription}>
            Manage your payment methods
          </Text>
        </View>

        {paymentMethods.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No payment methods added yet</Text>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <Image 
                  source={{ uri: getCardIcon(method.type) }} 
                  style={styles.cardTypeIcon} 
                  resizeMode="contain"
                />
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <CheckCircle size={12} color="#121212" />
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.cardNumber}>•••• •••• •••• {method.lastFour}</Text>
              <View style={styles.cardDetails}>
                <View>
                  <Text style={styles.cardDetailLabel}>Card Holder</Text>
                  <Text style={styles.cardDetailValue}>{method.name}</Text>
                </View>
                <View>
                  <Text style={styles.cardDetailLabel}>Expires</Text>
                  <Text style={styles.cardDetailValue}>{method.expiry}</Text>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity 
                    style={styles.cardAction}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <CheckCircle size={16} color={theme.colors.primary} />
                    <Text style={styles.cardActionText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.cardAction}
                  onPress={() => handleEditPaymentMethod(method.id)}
                >
                  <Edit size={16} color={theme.colors.text} />
                  <Text style={styles.cardActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cardAction}
                  onPress={() => handleRemovePaymentMethod(method.id)}
                >
                  <Trash2 size={16} color={theme.colors.error} />
                  <Text style={[styles.cardActionText, { color: theme.colors.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <Button
          title="Add Payment Method"
          onPress={handleAddPaymentMethod}
          variant="primary"
          size="large"
          icon={<Plus size={20} color="#121212" />}
          style={styles.addButton}
        />
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
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
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
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  paymentCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTypeIcon: {
    width: 60,
    height: 30,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  defaultText: {
    ...theme.typography.caption,
    color: "#121212",
    fontWeight: "600",
    marginLeft: 4,
  },
  cardNumber: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  cardDetailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  cardDetailValue: {
    ...theme.typography.body,
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.lg,
  },
  cardActionText: {
    ...theme.typography.bodySmall,
    marginLeft: 4,
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
});