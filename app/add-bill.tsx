import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  TextInput as RNTextInput,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import { useWalletStore } from "@/store/walletStore";
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  DollarSign, 
  FileText,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react-native";

// List of bill categories
const categories = [
  "Utilities",
  "Rent",
  "Internet",
  "Phone",
  "Subscription",
  "Insurance",
  "Credit Card",
  "Other",
];

// Define error state interface
interface ErrorState {
  billName: string;
  amount: string;
  dueDate: string;
  category: string;
}

// Calendar helper functions
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthName = (month: number): string => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month];
};

const getDayName = (date: Date): string => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[date.getDay()];
};

export default function AddBillScreen() {
  const router = useRouter();
  const { addBill } = useWalletStore();
  
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: number; month: number; year: number; isCurrentMonth: boolean; isToday: boolean }>>([]);
  
  // Form validation
  const [errors, setErrors] = useState<ErrorState>({
    billName: "",
    amount: "",
    dueDate: "",
    category: "",
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Input refs for focus management
  const amountRef = useRef<RNTextInput>(null);
  const descriptionRef = useRef<RNTextInput>(null);
  
  useEffect(() => {
    // Start animations
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
    
    // Generate calendar days when month or year changes
    generateCalendarDays();
  }, [currentMonth, currentYear]);
  
  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Get days from previous month to fill the first row
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    const days = [];
    
    // Add days from previous month
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      days.push({
        date: i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && 
                      currentMonth === today.getMonth() && 
                      currentYear === today.getFullYear();
      
      days.push({
        date: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
    const remainingDays = 42 - days.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    setCalendarDays(days);
  };
  
  // Navigate to previous month
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Handle date selection from calendar
  const handleDateSelect = (day: { date: number; month: number; year: number }) => {
    const newDate = new Date(day.year, day.month, day.date);
    setSelectedDate(newDate);
    
    // Format date as MM/DD/YYYY for display
    const formattedDate = `${(day.month + 1).toString().padStart(2, '0')}/${day.date.toString().padStart(2, '0')}/${day.year}`;
    setDueDate(formattedDate);
    setErrors({ ...errors, dueDate: "" });
    setShowCalendar(false);
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors: ErrorState = {
      billName: "",
      amount: "",
      dueDate: "",
      category: "",
    };
    
    if (!billName.trim()) {
      newErrors.billName = "Bill name is required";
      isValid = false;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid amount";
      isValid = false;
    }
    
    if (!dueDate.trim()) {
      newErrors.dueDate = "Due date is required";
      isValid = false;
    }
    
    if (!category.trim()) {
      newErrors.category = "Please select a category";
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      // Shake animation for error feedback
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: Platform.OS !== 'web' })
      ]).start();
    }
    
    return isValid;
  };
  
  const handleAddBill = () => {
    if (!validateForm()) {
      return;
    }
    
    // Format the date for consistency
    let formattedDate = "";
    if (dueDate.includes('/')) {
      const [month, day, year] = dueDate.split('/');
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      formattedDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    } else {
      formattedDate = dueDate;
    }
    
    // Add the bill
    addBill({
      name: billName,
      amount: parseFloat(amount),
      dueDate: formattedDate,
      category,
      description,
      // Generate a random logo for demo purposes
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(billName)}&background=random&color=fff`,
      billNumber: `BIL-${Math.floor(100000 + Math.random() * 900000)}`,
      accountNumber: `ACC-${Math.floor(10000000 + Math.random() * 90000000)}`,
      billingPeriod: `${new Date().toLocaleString('default', { month: 'short' })} 1 - ${new Date().toLocaleString('default', { month: 'short' })} 30, ${new Date().getFullYear()}`,
    });
    
    // Show success message
    Alert.alert(
      "Success",
      "Bill added successfully",
      [{ text: "OK", onPress: () => router.replace("/(tabs)/payments") }]
    );
  };
  
  const selectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategories(false);
    setErrors({ ...errors, category: "" });
    descriptionRef.current?.focus();
  };
  
  const renderErrorMessage = (message: string) => {
    if (!message) return null;
    
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={14} color={theme.colors.error} />
        <Text style={styles.errorText}>{message}</Text>
      </View>
    );
  };
  
  // Render calendar modal
  const renderCalendarModal = () => (
    <Modal
      visible={showCalendar}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Select Due Date</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavButton}>
              <ChevronLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {getMonthName(currentMonth)} {currentYear}
            </Text>
            
            <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
              <ChevronRight size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekdaysRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
              <Text key={`weekday-${index}`} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = 
                selectedDate.getDate() === day.date && 
                selectedDate.getMonth() === day.month && 
                selectedDate.getFullYear() === day.year;
              
              return (
                <TouchableOpacity
                  key={`day-${index}`}
                  style={[
                    styles.calendarDay,
                    !day.isCurrentMonth && styles.otherMonthDay,
                    day.isToday && styles.todayDay,
                    isSelected && styles.selectedDay
                  ]}
                  onPress={() => handleDateSelect(day)}
                >
                  <Text style={[
                    styles.calendarDayText,
                    !day.isCurrentMonth && styles.otherMonthDayText,
                    day.isToday && styles.todayDayText,
                    isSelected && styles.selectedDayText
                  ]}>
                    {day.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={styles.calendarFooter}>
            <Button
              title="Cancel"
              onPress={() => setShowCalendar(false)}
              variant="outline"
              size="medium"
              style={styles.calendarButton}
            />
            <Button
              title="Select"
              onPress={() => {
                // Format date as MM/DD/YYYY
                const formattedDate = `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getDate().toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
                setDueDate(formattedDate);
                setErrors({ ...errors, dueDate: "" });
                setShowCalendar(false);
              }}
              variant="primary"
              size="medium"
              style={styles.calendarButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Bill</Text>
          <View style={{ width: 24 }} />
        </View>

        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim }
              ]
            }
          ]}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formHeader}>
              <View style={styles.formIconContainer}>
                <FileText size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.formTitle}>Bill Information</Text>
              <Text style={styles.formSubtitle}>
                Enter the details of your bill to track and manage payments
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FileText size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  label="Bill Name"
                  placeholder="Enter bill name"
                  value={billName}
                  onChangeText={(text) => {
                    setBillName(text);
                    if (text.trim()) {
                      setErrors({ ...errors, billName: "" });
                    }
                  }}
                  containerStyle={styles.input}
                  returnKeyType="next"
                  onSubmitEditing={() => amountRef.current?.focus()}
                  error={!!errors.billName}
                />
                {renderErrorMessage(errors.billName)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <DollarSign size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  label="Amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (parseFloat(text) > 0) {
                      setErrors({ ...errors, amount: "" });
                    }
                  }}
                  keyboardType="numeric"
                  containerStyle={styles.input}
                  ref={amountRef}
                  returnKeyType="next"
                  error={!!errors.amount}
                />
                {renderErrorMessage(errors.amount)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Calendar size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  style={[
                    styles.dateSelector,
                    !!errors.dueDate && styles.inputError
                  ]}
                  onPress={() => setShowCalendar(true)}
                >
                  <Text style={styles.dateLabel}>Due Date</Text>
                  <View style={styles.dateValueContainer}>
                    <Text style={[
                      styles.dateValue,
                      !dueDate && styles.placeholderText
                    ]}>
                      {dueDate || "Select a date"}
                    </Text>
                    <Calendar size={16} color={theme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
                {renderErrorMessage(errors.dueDate)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Tag size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  style={[
                    styles.categorySelector,
                    !!errors.category && styles.inputError
                  ]}
                  onPress={() => setShowCategories(!showCategories)}
                >
                  <Text style={styles.categoryLabel}>Category</Text>
                  <Text style={[
                    styles.categoryValue,
                    !category && styles.placeholderText
                  ]}>
                    {category || "Select a category"}
                  </Text>
                </TouchableOpacity>
                {renderErrorMessage(errors.category)}
              </View>
            </View>

            {showCategories && (
              <View style={styles.categoriesList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryItem,
                      category === cat && styles.selectedCategory,
                    ]}
                    onPress={() => selectCategory(cat)}
                  >
                    {category === cat ? (
                      <Check size={16} color={theme.colors.primary} style={styles.categoryIcon} />
                    ) : null}
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat && styles.selectedCategoryText,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionHeader}>
                <Text style={styles.descriptionLabel}>Description (Optional)</Text>
                <Info size={14} color={theme.colors.textSecondary} />
              </View>
              <TextInput
                placeholder="Add a description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                containerStyle={styles.descriptionInput}
                inputStyle={styles.descriptionInputText}
                ref={descriptionRef}
              />
            </View>

            {/* Always use vertical layout for buttons to prevent truncation */}
            <View style={styles.buttonColumn}>
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="secondary"
                size="large"
                style={styles.fullWidthButton}
              />
              <Button
                title="Add Bill"
                onPress={handleAddBill}
                variant="primary"
                size="large"
                style={styles.fullWidthButton}
              />
            </View>
          </ScrollView>
        </Animated.View>
        
        {/* Calendar Modal */}
        {renderCalendarModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
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
  formHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  formIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  formTitle: {
    ...theme.typography.h3,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    marginTop: 8,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: 4,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  dateLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dateValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  dateValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  categoryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  categoryValue: {
    ...theme.typography.body,
    paddingVertical: 4,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  categoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.lg,
    marginLeft: 52, // Align with input fields
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryIcon: {
    marginRight: 4,
  },
  selectedCategory: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderColor: theme.colors.primary,
  },
  categoryItemText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  selectedCategoryText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  descriptionContainer: {
    marginBottom: theme.spacing.xl,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  descriptionLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  descriptionInput: {
    marginBottom: 0,
  },
  descriptionInputText: {
    height: 100,
    textAlignVertical: "top",
    color: theme.colors.text,
  },
  buttonColumn: {
    flexDirection: "column",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  fullWidthButton: {
    width: "100%",
  },
  // Calendar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  calendarModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  calendarTitle: {
    ...theme.typography.h4,
    fontWeight: '600',
    color: theme.colors.text,
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthYearText: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: '600',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  weekdayText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
  },
  calendarDay: {
    width: '14.28%', // 7 days per row
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthDayText: {
    color: theme.colors.textSecondary,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
  },
  todayDayText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: theme.colors.background,
    fontWeight: '600',
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  calendarButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});