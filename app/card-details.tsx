import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import LucraCard from "@/components/LucraCard";
import { useWalletStore } from "@/store/walletStore";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react-native";

export default function CardDetailsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isCardFrozen, freezeCard, unfreezeCard } = useWalletStore();
  
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [onlineTransactions, setOnlineTransactions] = useState(true);
  const [internationalTransactions, setInternationalTransactions] = useState(false);
  const [contactlessPayments, setContactlessPayments] = useState(true);
  const [atmWithdrawals, setAtmWithdrawals] = useState(true);
  
  // Mock card details
  const cardNumber = "4242 4242 4242 4242";
  const expiryDate = "12/25";
  const cvv = "123";
  
  const toggleCardDetails = () => {
    setShowCardDetails(!showCardDetails);
  };
  
  const copyToClipboard = async (text: string, label: string) => {
    try {
      // Using AsyncStorage as a workaround since expo-clipboard is not available
      await AsyncStorage.setItem('clipboard', text);
      Alert.alert(`${label} copied to clipboard`);
    } catch (error) {
      Alert.alert("Failed to copy to clipboard");
    }
  };
  
  const handleFreezeCard = () => {
    if (isCardFrozen) {
      Alert.alert(
        "Unfreeze Card",
        "Are you sure you want to unfreeze your card?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Unfreeze",
            onPress: () => {
              unfreezeCard();
              Alert.alert("Card Unfrozen", "Your card has been unfrozen and is now active.");
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Freeze Card",
        "Are you sure you want to freeze your card? This will prevent all transactions until unfrozen.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Freeze",
            onPress: () => {
              freezeCard();
              Alert.alert("Card Frozen", "Your card has been frozen. No transactions will be processed until unfrozen.");
            },
          },
        ]
      );
    }
  };
  
  const handleReportLost = () => {
    Alert.alert(
      "Report Lost or Stolen",
      "Are you sure you want to report this card as lost or stolen? This will permanently deactivate the card and a new one will be issued.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Report",
          onPress: () => {
            freezeCard();
            Alert.alert(
              "Card Reported",
              "Your card has been reported as lost/stolen and is now frozen. A new card will be sent to your address within 5-7 business days."
            );
          },
        },
      ]
    );
  };
  
  const handleRequestNewCard = () => {
    Alert.alert(
      "Request New Card",
      "Are you sure you want to request a new card? Your current card will remain active until the new one arrives.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Request",
          onPress: () => {
            router.push("/card-request");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <LucraCard
            name={user?.name || ""}
            showDetails={showCardDetails}
            frozen={isCardFrozen}
          />
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleCardDetails}
          >
            {showCardDetails ? (
              <EyeOff size={20} color={theme.colors.text} />
            ) : (
              <Eye size={20} color={theme.colors.text} />
            )}
            <Text style={styles.toggleButtonText}>
              {showCardDetails ? "Hide Details" : "Show Details"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {showCardDetails && (
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Card Number</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>{cardNumber}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(cardNumber.replace(/\s/g, ""), "Card number")}
                >
                  <Copy size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailGridItem}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValue}>{expiryDate}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(expiryDate, "Expiry date")}
                  >
                    <Copy size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.detailGridItem}>
                <Text style={styles.detailLabel}>CVV</Text>
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValue}>{cvv}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(cvv, "CVV")}
                  >
                    <Copy size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        )}
        
        <Card style={styles.actionsCard}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isCardFrozen ? styles.actionButtonUnfreeze : styles.actionButtonFreeze,
            ]}
            onPress={handleFreezeCard}
          >
            {isCardFrozen ? (
              <Unlock size={20} color={theme.colors.success} />
            ) : (
              <Lock size={20} color={theme.colors.error} />
            )}
            <Text
              style={[
                styles.actionButtonText,
                isCardFrozen
                  ? styles.actionButtonTextUnfreeze
                  : styles.actionButtonTextFreeze,
              ]}
            >
              {isCardFrozen ? "Unfreeze Card" : "Freeze Card"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRequestNewCard}
          >
            <RefreshCw size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Request New Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleReportLost}
          >
            <AlertTriangle size={20} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
              Report Lost or Stolen
            </Text>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Card Settings</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Online Transactions</Text>
              <Text style={styles.settingDescription}>
                Allow online and in-app purchases
              </Text>
            </View>
            <Switch
              value={onlineTransactions}
              onValueChange={setOnlineTransactions}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : onlineTransactions
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>International Transactions</Text>
              <Text style={styles.settingDescription}>
                Allow transactions outside your country
              </Text>
            </View>
            <Switch
              value={internationalTransactions}
              onValueChange={setInternationalTransactions}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : internationalTransactions
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Contactless Payments</Text>
              <Text style={styles.settingDescription}>
                Allow tap-to-pay transactions
              </Text>
            </View>
            <Switch
              value={contactlessPayments}
              onValueChange={setContactlessPayments}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : contactlessPayments
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>ATM Withdrawals</Text>
              <Text style={styles.settingDescription}>
                Allow cash withdrawals at ATMs
              </Text>
            </View>
            <Switch
              value={atmWithdrawals}
              onValueChange={setAtmWithdrawals}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : atmWithdrawals
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
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
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  toggleButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  detailsCard: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    marginBottom: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailGridItem: {
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailValue: {
    ...theme.typography.body,
    fontWeight: "500",
    color: theme.colors.text,
  },
  actionsCard: {
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionButtonFreeze: {
    borderBottomColor: "rgba(255, 107, 107, 0.3)",
  },
  actionButtonUnfreeze: {
    borderBottomColor: "rgba(74, 227, 168, 0.3)",
  },
  actionButtonDanger: {
    borderBottomWidth: 0,
  },
  actionButtonText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.md,
    color: theme.colors.text,
  },
  actionButtonTextFreeze: {
    color: theme.colors.error,
  },
  actionButtonTextUnfreeze: {
    color: theme.colors.success,
  },
  actionButtonTextDanger: {
    color: theme.colors.error,
  },
  settingsCard: {
    marginBottom: theme.spacing.xxl,
  },
  settingsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    ...theme.typography.body,
    fontWeight: "500",
    color: theme.colors.text,
  },
  settingDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});