import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput as RNTextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, Search } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function DisputeChargesScreen() {
  const router = useRouter();
  const { transactions } = useWalletStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter payment transactions only
  const paymentTransactions = transactions.filter(
    (transaction) => transaction.type === "payment"
  );
  
  const filteredTransactions = searchQuery
    ? paymentTransactions.filter(
        (transaction) =>
          transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.date.includes(searchQuery)
      )
    : paymentTransactions;
  
  const handleSubmitDispute = () => {
    if (!selectedTransaction) {
      Alert.alert("Error", "Please select a transaction to dispute");
      return;
    }
    
    if (!reason) {
      Alert.alert("Error", "Please select a reason for the dispute");
      return;
    }
    
    if (!description.trim()) {
      Alert.alert("Error", "Please provide details about the dispute");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        "Dispute Submitted",
        "Your dispute has been submitted successfully. We'll review your case and get back to you within 5-7 business days.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }, 1500);
  };
  
  const reasonOptions = [
    "Unauthorized transaction",
    "Duplicate charge",
    "Incorrect amount",
    "Product or service not received",
    "Product or service not as described",
    "Cancelled recurring payment",
    "Other",
  ];
  
  const isFormValid = selectedTransaction && reason && description.trim();
  
  return (
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
          <Text style={styles.headerTitle}>Dispute Charges</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <AlertTriangle size={24} color={theme.colors.warning} />
              <Text style={styles.infoTitle}>Dispute a Transaction</Text>
            </View>
            <Text style={styles.infoDescription}>
              If you don't recognize a transaction or believe it's incorrect, you can submit a dispute for review.
            </Text>
          </Card>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Transaction</Text>
            
            <View style={styles.searchContainer}>
              <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search transactions"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            {filteredTransactions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No transactions found</Text>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={[
                    styles.transactionCard,
                    selectedTransaction?.id === transaction.id && styles.selectedTransactionCard
                  ]}
                  onPress={() => setSelectedTransaction(transaction)}
                >
                  <View style={styles.transactionInfo}>
                    <View>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      ${transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
          
          {selectedTransaction && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reason for Dispute</Text>
                
                <View style={styles.reasonContainer}>
                  <RNTextInput
                    style={styles.reasonInput}
                    placeholder="Select a reason"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={reason}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.reasonButton}
                    onPress={() => {
                      Alert.alert(
                        "Select Reason",
                        "",
                        reasonOptions.map((option) => ({
                          text: option,
                          onPress: () => setReason(option),
                        }))
                      );
                    }}
                  >
                    {reason ? (
                      <ChevronUp size={20} color={theme.colors.text} />
                    ) : (
                      <ChevronDown size={20} color={theme.colors.text} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dispute Details</Text>
                <Text style={styles.sectionDescription}>
                  Please provide as much information as possible about the dispute.
                </Text>
                
                <RNTextInput
                  style={styles.descriptionInput}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              
              <Button
                title="Submit Dispute"
                onPress={handleSubmitDispute}
                variant="primary"
                size="large"
                loading={isLoading}
                disabled={!isFormValid}
                style={styles.submitButton}
              />
            </>
          )}
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
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  transactionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  selectedTransactionCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  transactionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionTitle: {
    ...theme.typography.body,
    fontWeight: "500",
  },
  transactionDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    ...theme.typography.body,
    fontWeight: "600",
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  reasonInput: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    ...theme.typography.body,
    paddingHorizontal: theme.spacing.md,
  },
  reasonButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body,
    height: 150,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
});