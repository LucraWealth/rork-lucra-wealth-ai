import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { ArrowLeft, FileText, AlertCircle, Check } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function PaperStatementsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [optedIn, setOptedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  const handleToggleOptIn = () => {
    if (optedIn) {
      // If already opted in, show confirmation dialog
      Alert.alert(
        "Cancel Paper Statements",
        "Are you sure you want to cancel paper statements?",
        [
          { text: "No", style: "cancel" },
          { 
            text: "Yes", 
            onPress: () => {
              setOptedIn(false);
              setConfirmed(false);
            } 
          }
        ]
      );
    } else {
      // If not opted in, toggle to opt in
      setOptedIn(true);
    }
  };
  
  const handleConfirm = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setConfirmed(true);
      
      Alert.alert(
        "Paper Statements Activated",
        "You will now receive monthly paper statements at your mailing address.",
        [{ text: "OK" }]
      );
    }, 1500);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paper Statements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <FileText size={24} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>Monthly Paper Statements</Text>
          </View>
          <Text style={styles.infoDescription}>
            Receive your monthly account statements by mail. A fee of $2.00 will be charged for each statement.
          </Text>
        </Card>
        
        <Card style={styles.optInCard}>
          <View style={styles.optInHeader}>
            <Text style={styles.optInTitle}>Opt in for Paper Statements</Text>
            <Switch
              value={optedIn}
              onValueChange={handleToggleOptIn}
              trackColor={{ false: "#333", true: "rgba(74, 227, 168, 0.4)" }}
              thumbColor={optedIn ? theme.colors.primary : "#f4f3f4"}
            />
          </View>
          
          {optedIn && !confirmed && (
            <>
              <View style={styles.feeWarning}>
                <AlertCircle size={16} color={theme.colors.warning} />
                <Text style={styles.feeWarningText}>
                  A fee of $2.00 will be charged monthly for paper statements.
                </Text>
              </View>
              
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Mailing Address:</Text>
                <Text style={styles.addressValue}>{user?.address || "123 Main St, Apt 4B"}</Text>
                <Text style={styles.addressValue}>{"Toronto, ON M5V 2N4"}</Text>
                <TouchableOpacity 
                  style={styles.changeAddressButton}
                  onPress={() => router.push("/personal-info")}
                >
                  <Text style={styles.changeAddressText}>Change Address</Text>
                </TouchableOpacity>
              </View>
              
              <Button
                title="Confirm & Activate"
                onPress={handleConfirm}
                variant="primary"
                size="large"
                loading={isLoading}
                style={styles.confirmButton}
              />
            </>
          )}
          
          {confirmed && (
            <View style={styles.confirmedContainer}>
              <View style={styles.confirmedBadge}>
                <Check size={16} color={theme.colors.success} />
                <Text style={styles.confirmedText}>Paper Statements Activated</Text>
              </View>
              <Text style={styles.confirmedDescription}>
                You will receive your first paper statement at the beginning of next month.
              </Text>
            </View>
          )}
        </Card>
        
        <Card style={styles.faqCard}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>When will I receive my statements?</Text>
            <Text style={styles.faqAnswer}>
              Paper statements are mailed within 5 business days after the end of each month.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I receive both paper and electronic statements?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you will continue to have access to electronic statements in the app even if you opt in for paper statements.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How can I cancel paper statements?</Text>
            <Text style={styles.faqAnswer}>
              You can cancel paper statements at any time by toggling off the option on this screen.
            </Text>
          </View>
        </Card>
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
  optInCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  optInHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  optInTitle: {
    ...theme.typography.body,
    fontWeight: "600",
  },
  feeWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  feeWarningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  addressContainer: {
    marginBottom: theme.spacing.lg,
  },
  addressLabel: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  addressValue: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  changeAddressButton: {
    marginTop: theme.spacing.sm,
  },
  changeAddressText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
  },
  confirmButton: {
    marginTop: theme.spacing.md,
  },
  confirmedContainer: {
    marginTop: theme.spacing.sm,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  confirmedText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: "600",
    marginLeft: 4,
  },
  confirmedDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  faqCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  faqTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  faqItem: {
    marginBottom: theme.spacing.md,
  },
  faqQuestion: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  faqAnswer: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});