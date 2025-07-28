import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import AutoPayCard from "@/components/AutoPayCard";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  BarChart3,
  Receipt,
  Repeat
} from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

const { width } = Dimensions.get("window");

// Define types for bill and history
interface BillHistory {
  date: string;
  amount: number;
  status: string;
  transactionId?: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  logoUrl?: string;
  billNumber?: string;
  accountNumber?: string;
  billingPeriod?: string;
  paymentMethod?: string;
  description?: string;
  history?: BillHistory[];
  autoPay?: {
    enabled: boolean;
    paymentMethod: string;
    paymentDate: number;
    nextPaymentDate?: string;
    lastPaymentDate?: string;
  };
}

 // Helper function to parse month name to number
const getMonthNumber = (monthName: string): number | undefined => {
  const months: Record<string, number> = {
    'January': 0, 'Jan': 0,
    'February': 1, 'Feb': 1,
    'March': 2, 'Mar': 2,
    'April': 3, 'Apr': 3,
    'May': 4,
    'June': 5, 'Jun': 5,
    'July': 6, 'Jul': 6,
    'August': 7, 'Aug': 7,
    'September': 8, 'Sep': 8, 'Sept': 8,
    'October': 9, 'Oct': 9,
    'November': 10, 'Nov': 10,
    'December': 11, 'Dec': 11
  };
  return months[monthName];
};

// Helper function to parse date consistently
const parseDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') {
    console.warn('Invalid date string:', dateString);
    return null;
  }

  try {
    let date;
    
    if (dateString.includes(',')) {
      // Format like "May 10, 2023" or "June 21, 2025"
      const parts = dateString.split(',');
      if (parts.length === 2) {
        const monthDay = parts[0].trim().split(' ');
        const year = parseInt(parts[1].trim());
        
        if (monthDay.length === 2) {
          const monthName = monthDay[0];
          const day = parseInt(monthDay[1]);
          const monthIndex = getMonthNumber(monthName);
          
          if (monthIndex !== undefined && !isNaN(day) && !isNaN(year)) {
            date = new Date(year, monthIndex, day);
          } else {
            console.warn('Invalid month/day/year:', monthName, day, year);
            return null;
          }
        } else {
          console.warn('Invalid month-day format:', monthDay);
          return null;
        }
      } else {
        console.warn('Invalid comma-separated format:', parts);
        return null;
      }
    } else if (dateString.includes('/')) {
      // Format like "MM/DD/YYYY"
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          date = new Date(year, month - 1, day); // month is 0-indexed
        } else {
          console.warn('Invalid MM/DD/YYYY format:', parts);
          return null;
        }
      } else {
        console.warn('Invalid slash format:', parts);
        return null;
      }
    } else if (dateString.includes('-')) {
      // Format like "YYYY-MM-DD"
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          date = new Date(year, month - 1, day); // month is 0-indexed
        } else {
          console.warn('Invalid YYYY-MM-DD format:', parts);
          return null;
        }
      } else {
        console.warn('Invalid dash format:', parts);
        return null;
      }
    } else {
      // Try standard Date constructor as fallback
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Date constructor failed for:', dateString);
        return null;
      }
    }
    
    // Final validation
    if (date && !isNaN(date.getTime())) {
      return date;
    } else {
      console.warn('Final date validation failed for:', dateString);
      return null;
    }
  } catch (error) {
    console.error("Error parsing date:", error, "Input:", dateString);
    return null;
  }
};

// REPLACE the existing formatDate function with this:
const formatDate = (dateString: string): string => {
  try {
    const date = parseDate(dateString);
    
    if (!date) {
      console.error("Failed to parse date for formatting:", dateString);
      return "Invalid Date";
    }
    
    // Use toLocaleDateString with specific options for consistency
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "Invalid Date";
  }
};

// REPLACE the existing calculateDaysUntilDue function with this:
const calculateDaysUntilDue = (dueDateString: string): number => {
  try {
    const dueDate = parseDate(dueDateString);
    
    if (!dueDate) {
      console.error("Failed to parse due date:", dueDateString);
      return 0;
    }
    
    // Get today's date and set to midnight for accurate day calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set due date to midnight for accurate comparison
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error("Error calculating days until due:", error, "Input:", dueDateString);
    return 0;
  }
};

export default function BillDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { bills, refreshBills, getBillPaymentHistory, toggleAutoPay, updateAutoPaySettings } = useWalletStore();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [paymentHistory, setPaymentHistory] = useState<BillHistory[]>([]);
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  
  const loadBillData = React.useCallback(() => {
    const billData = bills.find((b) => b.id === id);
    if (billData) {
      const processedBill: Bill = { 
        ...billData, 
        logoUrl: billData.logoUrl || '' 
      };
      setBill(processedBill);
      
      // Get real payment history
      const history = getBillPaymentHistory(billData.id);
      setPaymentHistory(history);
    } else {
      setBill(null);
      setPaymentHistory([]);
    }
    setIsLoading(false);
    
    // Start animations
    if (billData) {
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
    }
  }, [id, bills, fadeAnim, slideAnim, getBillPaymentHistory]);
  
  useEffect(() => {
    // Simulate API call to get bill data
    setTimeout(() => {
      loadBillData();
    }, 500);
  }, [loadBillData]);
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh bills data
      await refreshBills();
      // Reload bill data after refresh
      loadBillData();
    } catch (error) {
      console.error('Error refreshing bill data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshBills, loadBillData]);
  
  const handlePayNow = () => {
    if (!bill) return;
    
    router.push({
      pathname: "/bill-payment-confirm",
      params: {
        billId: bill.id,
        amount: bill.amount.toString(),
        billName: bill.name,
        category: bill.category,
        logoUrl: bill.logoUrl,
      },
    });
  };

  const handleViewAnalytics = () => {
    if (!bill) return;
    
    // Navigate to analytics with bill-specific data
    router.push({
      pathname: "/monthly-spending",
      params: {
        category: bill.category,
        title: `${bill.name} Analytics`,
      },
    });
  };

  const handleToggleAutoPay = (billId: string) => {
    toggleAutoPay(billId);
    // Reload bill data to reflect changes
    setTimeout(() => {
      loadBillData();
    }, 100);
  };

  const handleUpdateAutoPaySettings = (billId: string, settings: any) => {
    updateAutoPaySettings(billId, settings);
    // Reload bill data to reflect changes
    setTimeout(() => {
      loadBillData();
    }, 100);
  };
  
  // Calculate days until due
  const getDaysUntilDue = () => {
    if (!bill) return null;
    
    const diffDays = calculateDaysUntilDue(bill.dueDate);
    
    return {
      days: diffDays,
      isUrgent: diffDays <= 3 && diffDays >= 0,
      isPastDue: diffDays < 0
    };
  };
  
  const dueInfo = bill ? getDaysUntilDue() : null;
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading bill details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <XCircle size={40} color={theme.colors.error} />
          </View>
          <Text style={styles.errorTitle}>Bill Not Found</Text>
          <Text style={styles.errorText}>
            We couldn't find the bill you're looking for. It may have been deleted or the ID is invalid.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            size="medium"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Details</Text>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <View style={styles.billHeader}>
            <View style={styles.logoContainer}>
              <Image source={{ uri: bill.logoUrl }} style={styles.billLogo} />
            </View>
            <Text style={styles.billName}>{bill.name}</Text>
            <Text style={styles.billCategory}>{bill.category}</Text>
            
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  bill.isPaid ? styles.paidBadge : dueInfo?.isPastDue ? styles.pastDueBadge : dueInfo?.isUrgent ? styles.urgentBadge : styles.unpaidBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    bill.isPaid ? styles.paidText : dueInfo?.isPastDue ? styles.pastDueText : dueInfo?.isUrgent ? styles.urgentText : styles.unpaidText,
                  ]}
                >
                  {bill.isPaid 
                    ? "Paid" 
                    : dueInfo?.isPastDue 
                      ? "Overdue" 
                      : dueInfo?.isUrgent 
                        ? dueInfo.days === 0 ? "Due Today" : "Due Soon" 
                        : "Unpaid"}
                </Text>
              </View>
            </View>
          </View>
          
          <Card style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.amountValue}>${bill.amount.toFixed(2)}</Text>
            
            <View style={styles.dueDateContainer}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={styles.dueDateText}>Due {formatDate(bill.dueDate)}</Text>
            </View>
            
            {!bill.isPaid && (
              <View style={styles.dueStatusContainer}>
                <Clock size={16} color={
                  dueInfo?.isPastDue 
                    ? theme.colors.error 
                    : dueInfo?.isUrgent 
                      ? theme.colors.warning 
                      : theme.colors.textSecondary
                } />
                <Text style={[
                  styles.dueStatusText,
                  dueInfo?.isPastDue && styles.pastDueText,
                  dueInfo?.isUrgent && styles.urgentText
                ]}>
                  {dueInfo?.isPastDue 
                    ? `${Math.abs(dueInfo.days)} days overdue` 
                    : dueInfo?.days === 0 
                      ? "Due today" 
                      : `Due in ${dueInfo?.days} days`}
                </Text>
              </View>
            )}
          </Card>

          {/* Auto Pay Card */}
          <AutoPayCard
            billId={bill.id}
            billName={bill.name}
            billAmount={bill.amount}
            autoPay={bill.autoPay}
            onToggleAutoPay={handleToggleAutoPay}
            onUpdateSettings={handleUpdateAutoPaySettings}
          />
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "details" && styles.activeTab]}
              onPress={() => setActiveTab("details")}
            >
              <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>
                Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "history" && styles.activeTab]}
              onPress={() => setActiveTab("history")}
            >
              <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === "details" ? (
            <>
              {!bill.isPaid && dueInfo?.isUrgent && (
                <Card style={styles.warningCard}>
                  <View style={styles.warningHeader}>
                    <AlertCircle size={20} color={theme.colors.warning} />
                    <Text style={styles.warningTitle}>Payment Due Soon</Text>
                  </View>
                  <Text style={styles.warningText}>
                    This bill is due soon. Pay on time to avoid late fees and maintain a good payment history.
                  </Text>
                </Card>
              )}
              
              {!bill.isPaid && dueInfo?.isPastDue && (
                <Card style={styles.pastDueCard}>
                  <View style={styles.warningHeader}>
                    <AlertCircle size={20} color={theme.colors.error} />
                    <Text style={styles.pastDueTitle}>Payment Overdue</Text>
                  </View>
                  <Text style={styles.warningText}>
                    This bill is past due. Please make a payment as soon as possible to avoid additional fees and penalties.
                  </Text>
                </Card>
              )}
              
              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Bill Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bill Number</Text>
                  <Text style={styles.detailValue}>{bill.billNumber || "N/A"}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={styles.detailValue}>{bill.accountNumber || "N/A"}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Billing Period</Text>
                  <Text style={styles.detailValue}>{bill.billingPeriod || "N/A"}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <View style={styles.paymentMethodContainer}>
                    <CreditCard size={16} color={theme.colors.primary} />
                    <Text style={styles.paymentMethodText}>{bill.paymentMethod || "Card"}</Text>
                  </View>
                </View>
                
                {bill.description && (
                  <>
                    <View style={styles.divider} />
                    
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.descriptionText}>{bill.description}</Text>
                    </View>
                  </>
                )}
              </Card>
              
              <Card style={styles.actionsCard}>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/dispute-charges")}>
                  <View style={styles.actionIcon}>
                    <AlertCircle size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Dispute Charges</Text>
                    <Text style={styles.actionSubtitle}>Report incorrect charges</Text>
                  </View>
                  <ChevronRight size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                
                <View style={styles.actionDivider} />
                
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/paper-statements")}>
                  <View style={styles.actionIcon}>
                    <Receipt size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>View Statement</Text>
                    <Text style={styles.actionSubtitle}>Download PDF statement</Text>
                  </View>
                  <ChevronRight size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </Card>
            </>
          ) : (
            <>
              <Card style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Payment History</Text>
                  <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAnalytics}>
                    <BarChart3 size={16} color={theme.colors.primary} />
                    <Text style={styles.viewAllText}>View Analytics</Text>
                  </TouchableOpacity>
                </View>
                
                {paymentHistory && paymentHistory.length > 0 ? (
                  paymentHistory.map((item, index) => (
                    <View key={index}>
                      <View style={styles.historyItem}>
                        <View style={styles.historyItemLeft}>
                          <View style={styles.historyDateContainer}>
                            <Calendar size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.historyDate}>{item.date}</Text>
                          </View>
                          <View style={styles.historyStatusContainer}>
                            {item.status === "Paid" ? (
                              <CheckCircle2 size={14} color={theme.colors.primary} />
                            ) : (
                              <XCircle size={14} color={theme.colors.error} />
                            )}
                            <Text style={[
                              styles.historyStatus,
                              item.status === "Paid" ? styles.paidText : styles.pastDueText
                            ]}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.historyAmount}>${item.amount.toFixed(2)}</Text>
                      </View>
                      {index < paymentHistory.length - 1 && <View style={styles.historyDivider} />}
                    </View>
                  ))
                ) : (
                  <View style={styles.noHistoryContainer}>
                    <View style={styles.noHistoryIconContainer}>
                      <Receipt size={24} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.noHistoryText}>No payment history available</Text>
                  </View>
                )}
              </Card>
              
              <Card style={styles.statsCard}>
                <Text style={styles.statsTitle}>Payment Statistics</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {paymentHistory ? paymentHistory.filter(h => h.status === "Paid").length : 0}
                    </Text>
                    <Text style={styles.statLabel}>Payments Made</Text>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      ${paymentHistory ? paymentHistory.reduce((sum, h) => sum + h.amount, 0).toFixed(2) : "0.00"}
                    </Text>
                    <Text style={styles.statLabel}>Total Paid</Text>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {paymentHistory && paymentHistory.length > 0 
                        ? Math.round(paymentHistory.filter(h => h.status === "Paid").length / paymentHistory.length * 100) 
                        : 0}%
                    </Text>
                    <Text style={styles.statLabel}>On-Time Rate</Text>
                  </View>
                </View>
              </Card>
            </>
          )}
          
          {!bill.isPaid && (
            <Button
              title="Pay Now"
              onPress={handlePayNow}
              variant="primary"
              size="large"
              style={styles.payButton}
              icon={<CreditCard size={20} color={theme.colors.background} />}
            />
          )}
        </ScrollView>
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 86, 86, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  errorButton: {
    width: 200,
  },
  billHeader: {
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
  statusContainer: {
    marginTop: theme.spacing.sm,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  paidBadge: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
  },
  unpaidBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  urgentBadge: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  pastDueBadge: {
    backgroundColor: "rgba(255, 86, 86, 0.1)",
  },
  statusText: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
  },
  paidText: {
    color: theme.colors.primary,
  },
  unpaidText: {
    color: theme.colors.textSecondary,
  },
  urgentText: {
    color: theme.colors.warning,
  },
  pastDueText: {
    color: theme.colors.error,
  },
  amountCard: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  amountLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    ...theme.typography.h1,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  dueDateText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  dueStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  dueStatusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  // Warning Cards
  warningCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: theme.spacing.md,
  },
  pastDueCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: "rgba(255, 86, 86, 0.1)",
    padding: theme.spacing.md,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  warningTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
    color: theme.colors.warning,
  },
  pastDueTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
    color: theme.colors.error,
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Details Card
  detailsCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  detailsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
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
    fontWeight: "500",
    color: theme.colors.text,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  paymentMethodText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: "500",
  },
  descriptionContainer: {
    paddingVertical: theme.spacing.md,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  // Actions Card
  actionsCard: {
    marginBottom: theme.spacing.lg,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  actionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  // History Card
  historyCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  historyTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  viewAllText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  historyDate: {
    ...theme.typography.body,
    fontWeight: "500",
    color: theme.colors.text,
    marginLeft: 6,
  },
  historyStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyStatus: {
    ...theme.typography.caption,
    marginLeft: 6,
  },
  historyAmount: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  historyDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  noHistoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  noHistoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  noHistoryText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  // Stats Card
  statsCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  statsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  // Pay Button
  payButton: {
    marginBottom: theme.spacing.xxl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});