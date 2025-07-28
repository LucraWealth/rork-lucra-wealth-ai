import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function CardRequestScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [requestType, setRequestType] = useState<"new" | "replacement" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRequestCard = () => {
    if (!requestType) {
      Alert.alert("Error", "Please select a request type");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Navigate to success screen
      router.push({
        pathname: "/card-request-success",
        params: { type: requestType }
      });
    }, 1500);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <CreditCard size={24} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>Physical Card Request</Text>
          </View>
          <Text style={styles.infoDescription}>
            Request a physical debit card to use at ATMs and make in-person purchases.
          </Text>
        </Card>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Request Type</Text>
          
          <TouchableOpacity
            style={[
              styles.optionCard,
              requestType === "new" && styles.selectedOptionCard
            ]}
            onPress={() => setRequestType("new")}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>New Card</Text>
              <Text style={styles.optionDescription}>
                Request your first physical card
              </Text>
            </View>
            {requestType === "new" && (
              <CheckCircle size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionCard,
              requestType === "replacement" && styles.selectedOptionCard
            ]}
            onPress={() => setRequestType("replacement")}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Replacement Card</Text>
              <Text style={styles.optionDescription}>
                Replace a lost, stolen, or damaged card
              </Text>
            </View>
            {requestType === "replacement" && (
              <CheckCircle size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
          
          {requestType === "replacement" && (
            <View style={styles.feeWarning}>
              <AlertCircle size={16} color={theme.colors.warning} />
              <Text style={styles.feeWarningText}>
                A $5.00 fee will be charged for replacement cards.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          
          <Card style={styles.addressCard}>
            <Text style={styles.addressName}>{user?.name}</Text>
            <Text style={styles.addressLine}>{user?.address || "123 Main St, Apt 4B"}</Text>
            <Text style={styles.addressLine}>{"Toronto, ON M5V 2N4"}</Text>
            <Text style={styles.addressLine}>{"Canada"}</Text>
            
            <TouchableOpacity 
              style={styles.changeAddressButton}
              onPress={() => router.push("/personal-info")}
            >
              <Text style={styles.changeAddressText}>Change Address</Text>
            </TouchableOpacity>
          </Card>
          
          <Text style={styles.deliveryNote}>
            Delivery typically takes 7-10 business days.
          </Text>
        </View>
        
        <Button
          title="Request Card"
          onPress={handleRequestCard}
          variant="primary"
          size="large"
          loading={isLoading}
          disabled={!requestType}
          style={styles.requestButton}
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
  infoCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginLeft: theme.spacing.md,
  },
  infoDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  selectedOptionCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  optionDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  feeWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  feeWarningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  addressCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  addressName: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  addressLine: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  changeAddressButton: {
    marginTop: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  changeAddressText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
  },
  deliveryNote: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  requestButton: {
    marginTop: theme.spacing.md,
  },
});