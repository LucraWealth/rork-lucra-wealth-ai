import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";
import { ArrowLeft, Download, Share2, Copy, Check } from "lucide-react-native";

export default function VoidChequeScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  
  // Mock bank account details
  const bankDetails = {
    accountName: "John Doe",
    accountNumber: "****1234",
    transitNumber: "12345",
    institutionNumber: "001",
    bankName: "Royal Bank of Canada",
    branch: "Main Street Branch",
    address: "123 Main St, Toronto, ON M5V 2E8",
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `
          Void Cheque Details:
          Account Name: ${bankDetails.accountName}
          Account Number: ${bankDetails.accountNumber}
          Transit Number: ${bankDetails.transitNumber}
          Institution Number: ${bankDetails.institutionNumber}
          Bank: ${bankDetails.bankName}
          Branch: ${bankDetails.branch}
          Address: ${bankDetails.address}
        `,
        title: "Void Cheque Details",
      });
    } catch (error) {
      Alert.alert("Error", "Could not share void cheque details");
    }
  };
  
  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    Alert.alert(
      "Download Void Cheque",
      "Your void cheque PDF has been generated and will be downloaded.",
      [{ text: "OK" }]
    );
  };
  
  const copyToClipboard = (text: string, field: string) => {
    // In a real app, this would use Clipboard.setString(text)
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    Alert.alert("Copied", `${field} copied to clipboard`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Void Cheque</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          <Text style={styles.sectionDescription}>
            Use these details for direct deposits and pre-authorized payments
          </Text>
        </View>
        
        <View style={styles.chequeContainer}>
          <View style={styles.chequeHeader}>
            <Text style={styles.bankName}>{bankDetails.bankName}</Text>
            <Text style={styles.branchName}>{bankDetails.branch}</Text>
            <Text style={styles.branchAddress}>{bankDetails.address}</Text>
          </View>
          
          <View style={styles.chequeBody}>
            <View style={styles.accountInfoRow}>
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Transit Number</Text>
                <View style={styles.copyContainer}>
                  <Text style={styles.accountInfoValue}>{bankDetails.transitNumber}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(bankDetails.transitNumber, "Transit Number")}
                    style={styles.copyButton}
                  >
                    {copied === "Transit Number" ? (
                      <Check size={16} color={theme.colors.primary} />
                    ) : (
                      <Copy size={16} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.accountInfoItem}>
                <Text style={styles.accountInfoLabel}>Institution Number</Text>
                <View style={styles.copyContainer}>
                  <Text style={styles.accountInfoValue}>{bankDetails.institutionNumber}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(bankDetails.institutionNumber, "Institution Number")}
                    style={styles.copyButton}
                  >
                    {copied === "Institution Number" ? (
                      <Check size={16} color={theme.colors.primary} />
                    ) : (
                      <Copy size={16} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.accountInfoItem}>
              <Text style={styles.accountInfoLabel}>Account Number</Text>
              <View style={styles.copyContainer}>
                <Text style={styles.accountInfoValue}>{bankDetails.accountNumber}</Text>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                  style={styles.copyButton}
                >
                  {copied === "Account Number" ? (
                    <Check size={16} color={theme.colors.primary} />
                  ) : (
                    <Copy size={16} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.accountInfoItem}>
              <Text style={styles.accountInfoLabel}>Account Name</Text>
              <View style={styles.copyContainer}>
                <Text style={styles.accountInfoValue}>{bankDetails.accountName}</Text>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                  style={styles.copyButton}
                >
                  {copied === "Account Name" ? (
                    <Check size={16} color={theme.colors.primary} />
                  ) : (
                    <Copy size={16} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.chequeFooter}>
            <Text style={styles.voidText}>VOID</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This void cheque can be used to set up direct deposits or pre-authorized payments.
            The information provided is for your Lucra account.
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Download PDF"
            onPress={handleDownload}
            variant="outline"
            icon={<Download size={20} color={theme.colors.primary} />}
            style={styles.actionButton}
          />
          
          <Button
            title="Share Details"
            onPress={handleShare}
            variant="outline"
            icon={<Share2 size={20} color={theme.colors.primary} />}
            style={styles.actionButton}
          />
        </View>
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
  chequeContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chequeHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  bankName: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: 2,
  },
  branchName: {
    ...theme.typography.bodySmall,
    marginBottom: 2,
  },
  branchAddress: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  chequeBody: {
    marginBottom: theme.spacing.lg,
  },
  accountInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  accountInfoItem: {
    marginBottom: theme.spacing.md,
  },
  accountInfoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  accountInfoValue: {
    ...theme.typography.body,
    fontWeight: "500",
  },
  copyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyButton: {
    padding: 8,
  },
  chequeFooter: {
    alignItems: "center",
  },
  voidText: {
    ...theme.typography.h1,
    fontWeight: "700",
    color: "rgba(255, 82, 82, 0.7)",
    transform: [{ rotate: "-30deg" }],
  },
  infoContainer: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});