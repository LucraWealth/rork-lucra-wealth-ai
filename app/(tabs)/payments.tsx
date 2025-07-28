import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import { useWalletStore } from "@/store/walletStore";
import { 
  Plus, 
  CreditCard, 
  Receipt, 
  Banknote, 
  Bell, 
  Calendar as CalendarIcon,
  AlertCircle,
  ChevronRight,
  Clock,
  X,
  CheckCircle2,
  XCircle
} from "lucide-react-native";
import Button from "@/components/Button";

// Define types for calendar dates and bills
interface CalendarDate {
  date: number;
  day: string;
  month: string;
  full: Date;
  isToday: boolean;
}

// Get current date for calendar view
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

// Generate dates for calendar
const generateCalendarDates = (): CalendarDate[] => {
  const dates: CalendarDate[] = [];
  for (let i = 1; i <= 14; i++) {
    const date = new Date(currentYear, currentMonth, today.getDate() - 3 + i);
    dates.push({
      date: date.getDate(),
      day: date.toLocaleString('default', { weekday: 'short' }).substring(0, 3),
      month: date.toLocaleString('default', { month: 'short' }),
      full: date,
      isToday: date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear()
    });
  }
  return dates;
};

// Helper function to parse month name to number
const getMonthNumber = (monthName: string) => {
  const months = {
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
  return months[monthName as keyof typeof months];
};

// Helper function to parse date consistently
const parseDate = (dateString: string) => {
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

// Format date for display
const formatDate = (dateString: string) => {
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
      day: 'numeric',
      timeZone: 'UTC' // Add UTC to prevent timezone issues
    });
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "Invalid Date";
  }
};

// Calculate days until due
const calculateDaysUntilDue = (dueDateString: string) => {
  try {
    const dueDate = parseDate(dueDateString);
    
    if (!dueDate) {
      console.error("Failed to parse date for calculation:", dueDateString);
      return 0;
    }
    
    // Create today's date and normalize both dates to midnight UTC
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dueDateUTC = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));
    
    const diffTime = dueDateUTC.getTime() - todayUTC.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error("Error calculating days until due:", error, "Input:", dueDateString);
    return 0;
  }
};

export default function PaymentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bills");
  const { bills, payBill, transactions, refreshBills } = useWalletStore();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>(generateCalendarDates());
  const [billsDueToday, setBillsDueToday] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [paidBills, setPaidBills] = useState<any[]>([]);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDateBills, setSelectedDateBills] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const useVerticalLayout = windowWidth < 400; // Use vertical layout for narrow screens
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const calendarScrollRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    // Screen entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
    
    // Pulsing animation for primary button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Scroll to today in calendar
    setTimeout(() => {
      if (calendarScrollRef.current) {
        const todayIndex = calendarDates.findIndex(date => date.isToday);
        if (todayIndex !== -1) {
          calendarScrollRef.current.scrollTo({ 
            x: (todayIndex - 2) * 60, 
            animated: true 
          });
        }
      }
    }, 100);
    
    // Filter bills
    filterBills();
  }, [selectedDate, bills, transactions]); // Added transactions dependency to update when bills are paid
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh bills data
      await refreshBills();
      // Re-filter bills after refresh
      filterBills();
    } catch (error) {
      console.error('Error refreshing bills:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshBills]);
  
  const filterBills = () => {
    // Bills due today
    const dueToday = bills.filter(bill => {
      try {
        let dueDate: Date;
        
        if (bill.dueDate.includes(',')) {
          // Format like "May 15, 2023"
          const parts = bill.dueDate.split(',');
          const monthDay = parts[0].trim().split(' ');
          const month = monthDay[0];
          const day = parseInt(monthDay[1]);
          const year = parseInt(parts[1].trim());
          
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const monthIndex = monthNames.findIndex(m => m === month);
          
          if (monthIndex !== -1) {
            dueDate = new Date(year, monthIndex, day);
          } else {
            return false;
          }
        } else if (bill.dueDate.includes('/')) {
          // Format like "MM/DD/YYYY"
          const parts = bill.dueDate.split('/');
          dueDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
          // Try standard ISO format
          dueDate = new Date(bill.dueDate);
        }
        
        // Check if date is valid
        if (isNaN(dueDate.getTime())) {
          return false;
        }
        
        return !bill.isPaid && 
               dueDate.getDate() === selectedDate.getDate() && 
               dueDate.getMonth() === selectedDate.getMonth() && 
               dueDate.getFullYear() === selectedDate.getFullYear();
      } catch (error) {
        console.error("Error filtering bills:", error);
        return false;
      }
    });
    
    // Upcoming bills (not paid and due in the future)
    const upcoming = bills.filter(bill => {
      try {
        let dueDate: Date;
        
        if (bill.dueDate.includes(',')) {
          // Format like "May 15, 2023"
          const parts = bill.dueDate.split(',');
          const monthDay = parts[0].trim().split(' ');
          const month = monthDay[0];
          const day = parseInt(monthDay[1]);
          const year = parseInt(parts[1].trim());
          
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const monthIndex = monthNames.findIndex(m => m === month);
          
          if (monthIndex !== -1) {
            dueDate = new Date(year, monthIndex, day);
          } else {
            return false;
          }
        } else if (bill.dueDate.includes('/')) {
          // Format like "MM/DD/YYYY"
          const parts = bill.dueDate.split('/');
          dueDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
          // Try standard ISO format
          dueDate = new Date(bill.dueDate);
        }
        
        // Check if date is valid
        if (isNaN(dueDate.getTime())) {
          return false;
        }
        
        const today = new Date();
        
        return !bill.isPaid && 
               (dueDate > today || 
               (dueDate.getDate() !== selectedDate.getDate() || 
                dueDate.getMonth() !== selectedDate.getMonth() || 
                dueDate.getFullYear() !== selectedDate.getFullYear()));
      } catch (error) {
        console.error("Error filtering upcoming bills:", error);
        return false;
      }
    });
    
    // Paid bills
    const paid = bills.filter(bill => bill.isPaid);
    
    setBillsDueToday(dueToday);
    setUpcomingBills(upcoming);
    setPaidBills(paid);
  };

  // Get bills due on a specific date
  const getBillsDueOnDate = (date: Date): any[] => {
    return bills.filter(bill => {
      try {
        let dueDate: Date;
        
        if (bill.dueDate.includes(',')) {
          // Format like "May 15, 2023"
          const parts = bill.dueDate.split(',');
          const monthDay = parts[0].trim().split(' ');
          const month = monthDay[0];
          const day = parseInt(monthDay[1]);
          const year = parseInt(parts[1].trim());
          
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const monthIndex = monthNames.findIndex(m => m === month);
          
          if (monthIndex !== -1) {
            dueDate = new Date(year, monthIndex, day);
          } else {
            return false;
          }
        } else if (bill.dueDate.includes('/')) {
          // Format like "MM/DD/YYYY"
          const parts = bill.dueDate.split('/');
          dueDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
          // Try standard ISO format
          dueDate = new Date(bill.dueDate);
        }
        
        // Check if date is valid
        if (isNaN(dueDate.getTime())) {
          return false;
        }
        
        return dueDate.getDate() === date.getDate() && 
               dueDate.getMonth() === date.getMonth() && 
               dueDate.getFullYear() === date.getFullYear();
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    });
  };

  const handlePayNow = (billId: string, amount: number, billName: string, category: string, logoUrl: string) => {
    router.push({
      pathname: "/bill-payment-confirm",
      params: { 
        billId, 
        amount: amount.toString(), 
        billName, 
        category,
        logoUrl 
      }
    });
  };

  const handleDateSelect = (date: CalendarDate) => {
    setSelectedDate(date.full);
    
    // Get bills due on the selected date
    const billsOnDate = getBillsDueOnDate(date.full);
    setSelectedDateBills(billsOnDate);
    
    // Show modal if there are bills on this date or if the user clicks on any date
    setDateModalVisible(true);
  };

  const renderBillItem = ({ item }: { item: any }) => {
    // Calculate days until due
    const diffDays = calculateDaysUntilDue(item.dueDate);
    
    // Determine urgency
    const isUrgent = diffDays <= 3 && diffDays >= 0;
    const isPastDue = diffDays < 0;
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        key={item.id}
      >
        <TouchableOpacity
          onPress={() => router.push(`/bill/${item.id}`)}
          activeOpacity={0.7}
          style={styles.billCardContainer}
        >
          <Card style={styles.billCard}>
            <View style={styles.billHeader}>
              <View style={styles.billLogoContainer}>
                <Image source={{ uri: item.logoUrl }} style={styles.billLogo} />
              </View>
              <View style={styles.billInfo}>
                <Text style={styles.billName}>{item.name}</Text>
                <Text style={styles.billCategory}>{item.category}</Text>
                
                {!item.isPaid && (
                  <View style={styles.dueContainer}>
                    <Clock size={12} color={isUrgent ? theme.colors.warning : isPastDue ? theme.colors.error : theme.colors.textSecondary} />
                    <Text 
                      style={[
                        styles.dueDateSmall,
                        isUrgent && styles.urgentText,
                        isPastDue && styles.pastDueText
                      ]}
                    >
                      {isPastDue 
                        ? `${Math.abs(diffDays)} days overdue` 
                        : diffDays === 0 
                          ? "Due today" 
                          : `Due in ${diffDays} days`}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.billAmount}>
                <Text style={styles.billAmountText}>${item.amount.toFixed(2)}</Text>
                <Text style={styles.billDueDate}>{formatDate(item.dueDate)}</Text>
                
                {!item.isPaid && isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>
                      {diffDays === 0 ? "Today" : "Soon"}
                    </Text>
                  </View>
                )}
                
                {isPastDue && (
                  <View style={styles.pastDueBadge}>
                    <Text style={styles.pastDueBadgeText}>Overdue</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.billFooter}>
              {!item.isPaid ? (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayNow(item.id, item.amount, item.name, item.category, item.logoUrl)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidBadgeText}>Paid</Text>
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCalendarDate = ({ item, index }: { item: CalendarDate; index: number }) => {
    const isSelected = selectedDate.getDate() === item.full.getDate() && 
                       selectedDate.getMonth() === item.full.getMonth() && 
                       selectedDate.getFullYear() === item.full.getFullYear();
    
    const billsOnDate = getBillsDueOnDate(item.full);
    const hasBills = billsOnDate.length > 0;
    
    return (
      <TouchableOpacity
        key={`date-${item.full.toISOString()}`}
        style={[
          styles.calendarDate,
          isSelected && styles.selectedDate,
          item.isToday && styles.todayDate
        ]}
        onPress={() => handleDateSelect(item)}
      >
        <Text style={[
          styles.calendarDay,
          isSelected && styles.selectedDateText,
          item.isToday && !isSelected && styles.todayDateText
        ]}>
          {item.day}
        </Text>
        <Text style={[
          styles.calendarDateNumber,
          isSelected && styles.selectedDateText,
          item.isToday && !isSelected && styles.todayDateText
        ]}>
          {item.date}
        </Text>
        
        {/* Dot indicator for bills due on this date */}
        {hasBills && (
          <View style={[
            styles.dateDot,
            isSelected && styles.selectedDateDot
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderActionCard = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <TouchableOpacity 
      style={styles.actionCard} 
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        {icon}
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>
  );
  
  // Render modal content for selected date bills
  const renderDateModal = () => (
    <Modal
      visible={dateModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setDateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Bills Due on {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setDateModalVisible(false)}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedDateBills.length > 0 ? (
            <FlatList
              data={selectedDateBills}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalBillItem}
                  onPress={() => {
                    setDateModalVisible(false);
                    router.push(`/bill/${item.id}`);
                  }}
                >
                  <View style={styles.modalBillLeft}>
                    <Image source={{ uri: item.logoUrl }} style={styles.modalBillLogo} />
                    <View style={styles.modalBillInfo}>
                      <Text style={styles.modalBillName}>{item.name}</Text>
                      <Text style={styles.modalBillCategory}>{item.category}</Text>
                    </View>
                  </View>
                  <View style={styles.modalBillRight}>
                    <Text style={styles.modalBillAmount}>${item.amount.toFixed(2)}</Text>
                    <View style={[
                      styles.modalBillStatus,
                      item.isPaid ? styles.modalBillPaid : styles.modalBillUnpaid
                    ]}>
                      <Text style={[
                        styles.modalBillStatusText,
                        item.isPaid ? styles.modalBillPaidText : styles.modalBillUnpaidText
                      ]}>
                        {item.isPaid ? "Paid" : "Unpaid"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalBillsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.modalEmptyState}>
              <Receipt size={40} color={theme.colors.textSecondary} />
              <Text style={styles.modalEmptyText}>No bills due on this date</Text>
            </View>
          )}
          
          <View style={styles.modalFooter}>
            {selectedDateBills.length > 0 && !selectedDateBills.every(bill => bill.isPaid) ? (
              useVerticalLayout ? (
                // Vertical layout for narrow screens
                <View style={styles.modalButtonColumn}>
                  <Animated.View style={{ width: "100%", transform: [{ scale: pulseAnim }] }}>
                    <Button
                      title="Pay All Bills"
                      onPress={() => {
                        const unpaidBills = selectedDateBills.filter(bill => !bill.isPaid);
                        if (unpaidBills.length > 0) {
                          // Navigate to first unpaid bill payment
                          const firstBill = unpaidBills[0];
                          handlePayNow(
                            firstBill.id, 
                            firstBill.amount, 
                            firstBill.name, 
                            firstBill.category, 
                            firstBill.logoUrl
                          );
                          setDateModalVisible(false);
                        }
                      }}
                      variant="primary"
                      size="medium"
                      style={styles.modalFullWidthButton}
                      icon={<CreditCard size={18} color={theme.colors.background} />}
                    />
                  </Animated.View>
                  <Button
                    title="Close"
                    onPress={() => setDateModalVisible(false)}
                    variant="outline"
                    size="medium"
                    style={styles.modalFullWidthButton}
                  />
                </View>
              ) : (
                // Horizontal layout for wider screens
                <View style={styles.modalButtonRow}>
                  <Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
                    <Button
                      title="Pay All Bills"
                      onPress={() => {
                        const unpaidBills = selectedDateBills.filter(bill => !bill.isPaid);
                        if (unpaidBills.length > 0) {
                          // Navigate to first unpaid bill payment
                          const firstBill = unpaidBills[0];
                          handlePayNow(
                            firstBill.id, 
                            firstBill.amount, 
                            firstBill.name, 
                            firstBill.category, 
                            firstBill.logoUrl
                          );
                          setDateModalVisible(false);
                        }
                      }}
                      variant="primary"
                      size="medium"
                      style={styles.modalButton}
                      icon={<CreditCard size={18} color={theme.colors.background} />}
                    />
                  </Animated.View>
                  <Button
                    title="Close"
                    onPress={() => setDateModalVisible(false)}
                    variant="outline"
                    size="medium"
                    style={styles.modalButton}
                  />
                </View>
              )
            ) : (
              <Button
                title="Close"
                onPress={() => setDateModalVisible(false)}
                variant="outline"
                size="medium"
                style={styles.modalCloseButton}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <StatusBar style="light" />
        
        {/* Custom Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Payments</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notification-settings")}
          >
            <Bell size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "bills" && styles.activeTab]}
            onPress={() => setActiveTab("bills")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "bills" && styles.activeTabText,
              ]}
            >
              Bills
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "services" && styles.activeTab]}
            onPress={() => setActiveTab("services")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "services" && styles.activeTabText,
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "bills" ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          >
            {/* Bills Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Due</Text>
                  <Text style={styles.summaryValue}>
                    ${bills.filter(b => !b.isPaid).reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Due This Month</Text>
                  <Text style={styles.summaryValue}>
                    {bills.filter(b => !b.isPaid).length} Bills
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Paid</Text>
                  <Text style={styles.summaryValue}>
                    {bills.filter(b => b.isPaid).length} Bills
                  </Text>
                </View>
              </View>
            </Card>
            
            {/* Calendar View */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <CalendarIcon size={16} color={theme.colors.primary} />
                <Text style={styles.calendarTitle}>
                  {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <ScrollView
                ref={calendarScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.calendarScroll}
              >
                {calendarDates.map((item, index) => renderCalendarDate({ item, index }))}
              </ScrollView>
            </View>
            
            {/* Add Bill Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.addBillButton}
                onPress={() => router.push("/add-bill")}
              >
                <Plus size={18} color={theme.colors.background} />
                <Text style={styles.addBillText}>Add New Bill</Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Bills Due Today Section */}
            {billsDueToday.length > 0 && (
              <View style={styles.billsSection}>
                {renderSectionHeader("Due Today", billsDueToday.length)}
                {billsDueToday.map((item) => (
                  <View key={item.id}>
                    {renderBillItem({ item })}
                  </View>
                ))}
              </View>
            )}
            
            {/* Upcoming Bills Section */}
            {upcomingBills.length > 0 && (
              <View style={styles.billsSection}>
                {renderSectionHeader("Upcoming Bills", upcomingBills.length)}
                {upcomingBills.map((item) => (
                  <View key={item.id}>
                    {renderBillItem({ item })}
                  </View>
                ))}
              </View>
            )}
            
            {/* Paid Bills Section */}
            {paidBills.length > 0 && (
              <View style={styles.billsSection}>
                {renderSectionHeader("Paid Bills", paidBills.length)}
                {paidBills.map((item) => (
                  <View key={item.id}>
                    {renderBillItem({ item })}
                  </View>
                ))}
              </View>
            )}
            
            {/* Empty State */}
            {bills.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Receipt size={40} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Bills Found</Text>
                <Text style={styles.emptyText}>
                  You don't have any bills yet. Add your first bill to start tracking your payments.
                </Text>
                <Button
                  title="Add Your First Bill"
                  onPress={() => router.push("/add-bill")}
                  variant="primary"
                  size="medium"
                  style={styles.emptyButton}
                />
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.servicesScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          >
            <Text style={styles.servicesTitle}>Quick Services</Text>
            
            <View style={styles.servicesGrid}>
              {renderActionCard(
                <CreditCard size={24} color={theme.colors.primary} />,
                "Credit Card",
                () => router.push("/card-details")
              )}
              {renderActionCard(
                <Receipt size={24} color={theme.colors.primary} />,
                "Pay Bills",
                () => setActiveTab("bills")
              )}
            </View>
            
            <Text style={styles.servicesTitle}>Payment Methods</Text>
            
            <Card style={styles.paymentMethodCard}>
              <TouchableOpacity 
                style={styles.paymentMethodItem}
                onPress={() => router.push("/payment-methods")}
              >
                <View style={styles.paymentMethodIcon}>
                  <CreditCard size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodTitle}>Payment Methods</Text>
                  <Text style={styles.paymentMethodSubtitle}>Manage your cards and accounts</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </Card>
            
            <Text style={styles.servicesTitle}>Bill Management</Text>
            
            <Card style={styles.paymentMethodCard}>
              <TouchableOpacity 
                style={styles.paymentMethodItem}
                onPress={() => router.push("/add-bill")}
              >
                <View style={styles.paymentMethodIcon}>
                  <Plus size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodTitle}>Add New Bill</Text>
                  <Text style={styles.paymentMethodSubtitle}>Track and manage your recurring bills</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.paymentMethodDivider} />
              
              <TouchableOpacity 
                style={styles.paymentMethodItem}
                onPress={() => router.push("/paper-statements")}
              >
                <View style={styles.paymentMethodIcon}>
                  <Receipt size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodTitle}>Paper Statements</Text>
                  <Text style={styles.paymentMethodSubtitle}>View and download your statements</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </Card>
          </ScrollView>
        )}
        
        {/* Date Bills Modal */}
        {renderDateModal()}
      </SafeAreaView>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header Styles
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  // Tab Styles
  tabs: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
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
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 20,
  },
  // Summary Card
  summaryCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  // Calendar
  calendarContainer: {
    marginBottom: theme.spacing.lg,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  calendarTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  calendarScroll: {
    paddingVertical: theme.spacing.sm,
  },
  calendarDate: {
    width: 50,
    height: 70,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedDate: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  todayDate: {
    borderColor: theme.colors.primary,
  },
  calendarDay: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  calendarDateNumber: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  selectedDateText: {
    color: "#121212", // Dark text for better contrast on selected green background
  },
  todayDateText: {
    color: theme.colors.primary,
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  selectedDateDot: {
    backgroundColor: "#121212", // Dark dot for better contrast on selected green background
  },
  // Add Bill Button
  addBillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addBillText: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.background,
    marginLeft: theme.spacing.sm,
  },
  // Section Headers
  billsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  countText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  // Bill Cards
  billCardContainer: {
    marginBottom: theme.spacing.md,
  },
  billCard: {
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  billLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  billLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  billCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateSmall: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  urgentText: {
    color: theme.colors.warning,
  },
  pastDueText: {
    color: theme.colors.error,
  },
  billAmount: {
    alignItems: "flex-end",
  },
  billAmountText: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.text,
  },
  billDueDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  urgentBadge: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: 4,
  },
  urgentBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    fontWeight: "600",
  },
  pastDueBadge: {
    backgroundColor: "rgba(255, 86, 86, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: 4,
  },
  pastDueBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: "600",
  },
  billFooter: {
    marginTop: theme.spacing.md,
    alignItems: "flex-end",
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    color: theme.colors.background,
  },
  paidBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paidBadgeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    width: 200,
  },
  // Services Tab
  servicesScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 20,
  },
  servicesTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    width: (width - theme.spacing.xl * 2 - theme.spacing.md * 2) / 2,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionTitle: {
    ...theme.typography.bodySmall,
    textAlign: "center",
    color: theme.colors.text,
  },
  // Payment Methods
  paymentMethodCard: {
    marginBottom: theme.spacing.xl,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  paymentMethodSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  paymentMethodDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h4,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBillsList: {
    paddingBottom: theme.spacing.md,
  },
  modalBillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalBillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalBillLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  modalBillInfo: {
    flex: 1,
  },
  modalBillName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalBillCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  modalBillRight: {
    alignItems: 'flex-end',
  },
  modalBillAmount: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  modalBillStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  modalBillPaid: {
    backgroundColor: 'rgba(74, 227, 168, 0.1)',
  },
  modalBillUnpaid: {
    backgroundColor: 'rgba(255, 86, 86, 0.1)',
  },
  modalBillStatusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  modalBillPaidText: {
    color: theme.colors.primary,
  },
  modalBillUnpaidText: {
    color: theme.colors.error,
  },
  modalEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalEmptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modalButtonColumn: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  modalFullWidthButton: {
    width: "100%",
  },
  modalCloseButton: {
    width: "100%",
  },
  modalPayAllButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
});