import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Animated,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "@/constants/theme";
import { AutoPaySettings } from "@/store/walletStore";
import {
  Calendar,
  CreditCard,
  Settings,
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
  Repeat,
  AlertCircle,
  ChevronDown,
} from "lucide-react-native";
import Card from "./Card";
import Button from "./Button";

interface AutoPayCardProps {
  billId: string;
  billName: string;
  billAmount: number;
  autoPay?: AutoPaySettings;
  onToggleAutoPay: (billId: string) => void;
  onUpdateSettings: (billId: string, settings: Partial<AutoPaySettings>) => void;
}

// Calendar component for date selection
const CalendarPicker = ({ 
  selectedDate, 
  onDateSelect, 
  onClose 
}: { 
  selectedDate: number; 
  onDateSelect: (date: number) => void; 
  onClose: () => void; 
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const handleDateSelect = (day: number) => {
    onDateSelect(day);
  };
  
  const handleBackdropPress = () => {
    onClose();
  };
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.calendarOverlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Select Payment Date</Text>
            <TouchableOpacity 
              style={styles.calendarCloseButton} 
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.calendarContent} showsVerticalScrollIndicator={false}>
            <View style={styles.daysGrid}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDate === day && styles.selectedDayButton
                  ]}
                  onPress={() => handleDateSelect(day)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDate === day && styles.selectedDayText
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Payment method selector
const PaymentMethodPicker = ({ 
  selectedMethod, 
  onMethodSelect, 
  onClose 
}: { 
  selectedMethod: string; 
  onMethodSelect: (method: string) => void; 
  onClose: () => void; 
}) => {
  const paymentMethods = [
    { id: "visa-4242", name: "Visa •••• 4242", icon: "💳" },
    { id: "mastercard-8888", name: "Mastercard •••• 8888", icon: "💳" },
    { id: "amex-1005", name: "Amex •••• 1005", icon: "💳" },
    { id: "bank-account", name: "Bank Account •••• 1234", icon: "🏦" },
  ];
  
  const handleMethodSelect = (method: string) => {
    onMethodSelect(method);
  };
  
  const handleBackdropPress = () => {
    onClose();
  };
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.paymentMethodOverlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
        <View style={styles.paymentMethodContainer}>
          <View style={styles.paymentMethodHeader}>
            <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
            <TouchableOpacity 
              style={styles.paymentMethodCloseButton} 
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.paymentMethodContent} showsVerticalScrollIndicator={false}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodOption,
                  selectedMethod === method.name && styles.selectedPaymentMethod
                ]}
                onPress={() => handleMethodSelect(method.name)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <Text style={[
                  styles.paymentMethodName,
                  selectedMethod === method.name && styles.selectedPaymentMethodText
                ]}>
                  {method.name}
                </Text>
                {selectedMethod === method.name && (
                  <CheckCircle2 size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function AutoPayCard({
  billId,
  billName,
  billAmount,
  autoPay,
  onToggleAutoPay,
  onUpdateSettings,
}: AutoPayCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [paymentMethodVisible, setPaymentMethodVisible] = useState(false);
  const [paymentDate, setPaymentDate] = useState(autoPay?.paymentDate || 15);
  const [paymentMethod, setPaymentMethod] = useState(autoPay?.paymentMethod || "Visa •••• 4242");
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const expandAnim = useRef(new Animated.Value(autoPay?.enabled ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
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
      }),
    ]).start();

    // Pulse animation for enabled state
    if (autoPay?.enabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  useEffect(() => {
    // Animate expand/collapse when auto pay is toggled
    Animated.timing(expandAnim, {
      toValue: autoPay?.enabled ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [autoPay?.enabled]);

  // Sync local state with autoPay prop changes
  useEffect(() => {
    if (autoPay) {
      setPaymentDate(autoPay.paymentDate || 15);
      setPaymentMethod(autoPay.paymentMethod || "Visa •••• 4242");
    }
  }, [autoPay?.paymentDate, autoPay?.paymentMethod]);

  const handleToggle = () => {
    if (isInteractionDisabled) return;
    setIsInteractionDisabled(true);
    onToggleAutoPay(billId);
    // Re-enable interactions after a short delay
    setTimeout(() => {
      setIsInteractionDisabled(false);
    }, 500);
  };

  const handleSaveSettings = () => {
    if (isInteractionDisabled) return;
    
    setIsInteractionDisabled(true);
    
    // Calculate next payment date
    const today = new Date();
    let nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDate);
    
    // If the payment date has already passed this month, schedule for next month
    if (paymentDate <= today.getDate()) {
      nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDate);
    } else {
      nextMonth = new Date(today.getFullYear(), today.getMonth(), paymentDate);
    }
    
    const nextPaymentDate = nextMonth.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    console.log('Saving auto pay settings:', {
      paymentDate,
      paymentMethod,
      nextPaymentDate
    });

    onUpdateSettings(billId, {
      paymentDate,
      paymentMethod,
      nextPaymentDate,
      nextPaymentDateRaw: nextMonth.toISOString(), // Store raw date for calculations
    });

    setModalVisible(false);
    
    // Re-enable interactions after a delay
    setTimeout(() => {
      setIsInteractionDisabled(false);
    }, 500);
  };

  const handleCalendarPress = () => {
    if (isInteractionDisabled || calendarVisible || paymentMethodVisible) return;
    console.log('Calendar button pressed');
    setCalendarVisible(true);
  };

  const handlePaymentMethodPress = () => {
    if (isInteractionDisabled || calendarVisible || paymentMethodVisible) return;
    console.log('Payment method button pressed');
    setPaymentMethodVisible(true);
  };

  const handleCloseCalendar = () => {
    setCalendarVisible(false);
  };

  const handleClosePaymentMethod = () => {
    setPaymentMethodVisible(false);
  };

  const handleDateSelect = (date: number) => {
    setPaymentDate(date);
    setCalendarVisible(false);
  };

  const handleMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setPaymentMethodVisible(false);
  };

  const formatNextPaymentDate = () => {
    if (!autoPay?.nextPaymentDate) return "Not scheduled";
    return autoPay.nextPaymentDate;
  };

  const getDaysUntilNextPayment = () => {
    if (!autoPay?.nextPaymentDate) return null;
    
    try {
      let nextDate;
      
      // Try to use the raw date first (if available), otherwise parse the formatted date
      if (autoPay.nextPaymentDateRaw) {
        nextDate = new Date(autoPay.nextPaymentDateRaw);
      } else {
        // Fallback: try to parse the formatted date
        nextDate = new Date(autoPay.nextPaymentDate);
      }
      
      // If still invalid, calculate based on payment date
      if (isNaN(nextDate.getTime())) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Try current month first
        nextDate = new Date(currentYear, currentMonth, autoPay.paymentDate || 15);
        
        // If the date has passed this month, use next month
        if (nextDate <= today) {
          nextDate = new Date(currentYear, currentMonth + 1, autoPay.paymentDate || 15);
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      nextDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "Overdue";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      return `in ${diffDays} days`;
    } catch (error) {
      console.log('Error calculating days until payment:', error);
      return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: autoPay?.enabled ? pulseAnim : 1 }
          ]
        }
      ]}
    >
      <Card style={[styles.card, autoPay?.enabled && styles.cardEnabled]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, autoPay?.enabled && styles.iconContainerEnabled]}>
              <Repeat size={20} color={autoPay?.enabled ? theme.colors.background : theme.colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Auto Pay</Text>
              <Text style={styles.subtitle}>
                {autoPay?.enabled ? "Automatic payments enabled" : "Set up automatic payments"}
              </Text>
            </View>
          </View>
          
          <Switch
            value={autoPay?.enabled || false}
            onValueChange={handleToggle}
            disabled={isInteractionDisabled}
            trackColor={{
              false: "rgba(255, 255, 255, 0.1)",
              true: "rgba(74, 227, 168, 0.3)"
            }}
            thumbColor={autoPay?.enabled ? theme.colors.primary : "#f4f3f4"}
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
          />
        </View>

        {/* Expanded Content */}
        <Animated.View
          style={[
            styles.expandedContent,
            {
              height: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 140],
              }),
              opacity: expandAnim,
            }
          ]}
        >
          {autoPay?.enabled && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Calendar size={16} color={theme.colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Next Payment</Text>
                    <Text style={styles.detailValue}>
                      {formatNextPaymentDate()}
                    </Text>
                    {getDaysUntilNextPayment() && (
                      <Text style={styles.detailSubtext}>
                        {getDaysUntilNextPayment()}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <CreditCard size={16} color={theme.colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailValue}>
                      ${billAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.detailSubtext}>
                      {autoPay.paymentMethod}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  if (!isInteractionDisabled && !calendarVisible && !paymentMethodVisible) {
                    setModalVisible(true);
                  }
                }}
                disabled={isInteractionDisabled}
              >
                <Settings size={16} color={theme.colors.primary} />
                <Text style={styles.manageButtonText}>Manage Auto Pay</Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Success Indicator */}
        {autoPay?.enabled && autoPay?.lastPaymentDate && (
          <View style={styles.successIndicator}>
            <CheckCircle2 size={14} color={theme.colors.primary} />
            <Text style={styles.successText}>
              Last payment: {autoPay.lastPaymentDate}
            </Text>
          </View>
        )}
      </Card>

      {/* Settings Modal */}
      <Modal
        visible={modalVisible && !calendarVisible && !paymentMethodVisible}
        transparent={true}
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          if (!isInteractionDisabled) {
            setModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              if (!isInteractionDisabled) {
                setModalVisible(false);
              }
            }}
            activeOpacity={1}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Auto Pay Settings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  if (!isInteractionDisabled) {
                    setModalVisible(false);
                  }
                }}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                disabled={isInteractionDisabled}
              >
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.billInfo}>
                <Text style={styles.billInfoTitle}>{billName}</Text>
                <Text style={styles.billInfoAmount}>${billAmount.toFixed(2)}</Text>
              </View>

              {/* Payment Date Section */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Payment Date (Day of Month)</Text>
                <TouchableOpacity 
                  style={[
                    styles.inputCard,
                    (isInteractionDisabled || calendarVisible || paymentMethodVisible) && styles.disabledCard
                  ]}
                  onPress={handleCalendarPress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isInteractionDisabled || calendarVisible || paymentMethodVisible}
                >
                  <Calendar size={20} color={theme.colors.primary} />
                  <Text style={styles.inputText}>{paymentDate}</Text>
                  <ChevronDown size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Payment Method Section */}
              <View style={styles.paymentMethodSection}>
                <Text style={styles.sectionLabel}>Payment Method</Text>
                <TouchableOpacity 
                  style={[
                    styles.paymentMethodCard,
                    (isInteractionDisabled || calendarVisible || paymentMethodVisible) && styles.disabledCard
                  ]}
                  onPress={handlePaymentMethodPress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isInteractionDisabled || calendarVisible || paymentMethodVisible}
                >
                  <CreditCard size={20} color={theme.colors.primary} />
                  <Text style={styles.paymentMethodText}>{paymentMethod}</Text>
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.warningCard}>
                <AlertCircle size={16} color={theme.colors.warning} />
                <Text style={styles.warningText}>
                  Auto Pay will charge your selected payment method on the specified date each month. 
                  Make sure you have sufficient funds available.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => {
                  if (!isInteractionDisabled) {
                    setModalVisible(false);
                  }
                }}
                variant="outline"
                size="medium"
                style={styles.modalButton}
                disabled={isInteractionDisabled}
              />
              <Button
                title="Save Settings"
                onPress={handleSaveSettings}
                variant="primary"
                size="medium"
                style={styles.modalButton}
                icon={<CheckCircle2 size={18} color={theme.colors.background} />}
                disabled={isInteractionDisabled}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Picker */}
      {calendarVisible && (
        <CalendarPicker
          selectedDate={paymentDate}
          onDateSelect={handleDateSelect}
          onClose={handleCloseCalendar}
        />
      )}

      {/* Payment Method Picker */}
      {paymentMethodVisible && (
        <PaymentMethodPicker
          selectedMethod={paymentMethod}
          onMethodSelect={handleMethodSelect}
          onClose={handleClosePaymentMethod}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardEnabled: {
    borderColor: "rgba(74, 227, 168, 0.3)",
    backgroundColor: "rgba(74, 227, 168, 0.02)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  iconContainerEnabled: {
    backgroundColor: theme.colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  expandedContent: {
    overflow: "hidden",
  },
  detailsContainer: {
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  detailText: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    marginBottom: 2,
  },
  detailSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  manageButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  successIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  successText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: "500",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  billInfo: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: "rgba(74, 227, 168, 0.05)",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.1)",
  },
  billInfoTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  billInfoAmount: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 56,
  },
  inputText: {
    ...theme.typography.body,
    fontWeight: "500",
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  paymentMethodSection: {
    marginBottom: theme.spacing.lg,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 56,
  },
  paymentMethodText: {
    ...theme.typography.body,
    fontWeight: "500",
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.2)",
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    lineHeight: 18,
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  disabledCard: {
    opacity: 0.5,
  },
  // Calendar Styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  calendarContainer: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  calendarTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    flex: 1,
  },
  calendarCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  calendarContent: {
    padding: theme.spacing.lg,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayButton: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 48,
    minWidth: 48,
  },
  selectedDayButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    ...theme.typography.bodySmall,
    fontWeight: "500",
    color: theme.colors.text,
  },
  selectedDayText: {
    color: theme.colors.background,
    fontWeight: "600",
  },
  // Payment Method Picker Styles
  paymentMethodOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  paymentMethodContainer: {
    width: "90%",
    maxHeight: "60%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  paymentMethodTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    flex: 1,
  },
  paymentMethodCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  paymentMethodContent: {
    padding: theme.spacing.lg,
  },
  paymentMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 64,
  },
  selectedPaymentMethod: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  paymentMethodIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  paymentMethodName: {
    ...theme.typography.body,
    fontWeight: "500",
    flex: 1,
    color: theme.colors.text,
  },
  selectedPaymentMethodText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});