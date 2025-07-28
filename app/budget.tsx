import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useWalletStore, BudgetCategory } from "@/store/walletStore";
import { transactions } from "@/mocks/transactions";
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Coffee,
  Music,
  Car,
  ShoppingBag,
  Heart,
  DollarSign,
  PieChart,
  Calendar,
  Home,
  Smartphone,
  Gamepad2,
  Check,
  ChevronDown,
} from "lucide-react-native";
import Button from "@/components/Button";
import Card from "@/components/Card";
import BudgetCategoryCard from "@/components/BudgetCategoryCard";

const { width: screenWidth } = Dimensions.get("window");

const iconMap: Record<string, any> = {
  Zap,
  Coffee,
  Music,
  Car,
  ShoppingBag,
  Heart,
  DollarSign,
  Home,
  Smartphone,
  Gamepad2,
};

// Get unique transaction categories from existing transactions
const getTransactionCategories = () => {
  const categories = new Set<string>();
  transactions.forEach(transaction => {
    if (transaction.category) {
      categories.add(transaction.category);
    }
  });
  return Array.from(categories).sort();
};

export default function BudgetScreen() {
  const router = useRouter();
  const { budgetCategories, setBudgetLimit, addBudgetCategory, removeBudgetCategory, updateBudgetSpending } = useWalletStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLimit, setNewCategoryLimit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("DollarSign");
  const [selectedColor, setSelectedColor] = useState("#4AE3A8");
  const [selectedTransactionCategory, setSelectedTransactionCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const transactionCategories = getTransactionCategories();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const summarySlideAnim = useRef(new Animated.Value(50)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Update budget spending when component mounts
    updateBudgetSpending();
    
    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(headerScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(summarySlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    // Modal animation
    if (showAddModal) {
      Animated.parallel([
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalOpacityAnim.setValue(0);
      modalScaleAnim.setValue(0.9);
    }
  }, [showAddModal]);

  // Calculate totals
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.limit, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryLimit && selectedTransactionCategory) {
      const limit = parseFloat(newCategoryLimit);
      if (!isNaN(limit) && limit > 0) {
        addBudgetCategory({
          name: newCategoryName,
          limit,
          color: selectedColor,
          icon: selectedIcon,
          transactionCategory: selectedTransactionCategory,
        });
        setShowAddModal(false);
        setNewCategoryName("");
        setNewCategoryLimit("");
        setSelectedIcon("DollarSign");
        setSelectedColor("#4AE3A8");
        setSelectedTransactionCategory("");
      }
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => removeBudgetCategory(categoryId)
        }
      ]
    );
  };

  const getOverallStatusColor = () => {
    if (overallPercentage >= 100) return "#FF6B6B";
    if (overallPercentage >= 80) return "#FFD166";
    return "#4AE3A8";
  };

  const colors = [
    "#4AE3A8", "#4A8FE7", "#FF6B6B", "#9B59B6", 
    "#F39C12", "#E74C3C", "#2ECC71", "#3498DB",
    "#FF9500", "#007AFF", "#34C759", "#FF3B30"
  ];

  const icons = ["Zap", "Coffee", "Music", "Car", "ShoppingBag", "Heart", "DollarSign", "Home", "Smartphone", "Gamepad2"];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim,
        }}
      >
        <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
          <StatusBar style="light" />
          
          {/* Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                transform: [{ scale: headerScaleAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <PieChart size={24} color={theme.colors.primary} />
              <Text style={styles.headerTitle}>Budget Manager</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, budgetCategories.length === 0 && styles.scrollContentEmpty]}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            {/* Summary Section */}
            <Animated.View
              style={{
                transform: [{ translateY: summarySlideAnim }]
              }}
            >
              <Card style={[styles.summaryCard, theme.shadows.large]}>
                <View style={styles.summaryHeader}>
                  <View style={styles.summaryTitleContainer}>
                    <Calendar size={20} color={theme.colors.primary} />
                    <Text style={styles.summaryTitle}>Monthly Overview</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getOverallStatusColor() + '20' }]}>
                    <Text style={[styles.statusText, { color: getOverallStatusColor() }]}>
                      {overallPercentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Budget</Text>
                    <Text style={styles.statAmount}>${totalBudget.toFixed(2)}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={[styles.statAmount, { color: "#FF6B6B" }]}>
                      ${totalSpent.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Remaining</Text>
                    <Text style={[styles.statAmount, { color: getOverallStatusColor() }]}>
                      ${Math.abs(totalRemaining).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.overallProgress}>
                  <View style={styles.progressHeader}>
                    {totalRemaining >= 0 ? (
                      <TrendingUp size={18} color="#4AE3A8" />
                    ) : (
                      <TrendingDown size={18} color="#FF6B6B" />
                    )}
                    <Text style={[
                      styles.progressText,
                      { color: totalRemaining >= 0 ? "#4AE3A8" : "#FF6B6B" }
                    ]}>
                      {totalRemaining >= 0 ? "On track" : "Over budget"}
                    </Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBackground}>
                      <Animated.View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${Math.min(overallPercentage, 100)}%`,
                            backgroundColor: getOverallStatusColor(),
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>

            {/* Categories Section */}
            <Animated.View
              style={[
                styles.categoriesSection,
                {
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Target size={20} color={theme.colors.text} />
                  <Text style={styles.sectionTitle}>Budget Categories</Text>
                </View>
                <Text style={styles.categoryCount}>
                  {budgetCategories.length} {budgetCategories.length === 1 ? 'category' : 'categories'}
                </Text>
              </View>
              
              {budgetCategories.length > 0 ? (
                budgetCategories.map((category, index) => (
                  <BudgetCategoryCard
                    key={category.id}
                    category={category}
                    onEdit={setBudgetLimit}
                    onDelete={handleDeleteCategory}
                    index={index}
                  />
                ))
              ) : (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyContent}>
                    <View style={styles.emptyIcon}>
                      <PieChart size={48} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyTitle}>No budget categories yet</Text>
                    <Text style={styles.emptySubtext}>
                      Create your first category to start tracking your spending and reach your financial goals
                    </Text>
                    <Button
                      title="Create Category"
                      onPress={() => setShowAddModal(true)}
                      style={styles.emptyButton}
                    />
                  </View>
                </Card>
              )}
            </Animated.View>
          </ScrollView>

          {/* Add Category Modal */}
          <Modal
            visible={showAddModal}
            transparent
            animationType="none"
            onRequestClose={() => setShowAddModal(false)}
          >
            <Animated.View 
              style={[
                styles.modalOverlay,
                { opacity: modalOpacityAnim }
              ]}
            >
              <Animated.View 
                style={[
                  styles.modalContent,
                  {
                    transform: [{ scale: modalScaleAnim }]
                  }
                ]}
              >
                <ScrollView 
                  style={styles.modalScrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Create Budget Category</Text>
                    <Text style={styles.modalSubtitle}>Set up a new spending category to track</Text>
                  </View>
                  
                  <View style={styles.modalForm}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Category Name</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        placeholder="e.g., Groceries, Entertainment"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Monthly Budget Limit</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={newCategoryLimit}
                        onChangeText={setNewCategoryLimit}
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Transaction Category Mapping */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Map to Transaction Category *</Text>
                      <TouchableOpacity
                        style={[
                          styles.modalInput,
                          styles.dropdownButton,
                          !selectedTransactionCategory && styles.dropdownPlaceholder
                        ]}
                        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      >
                        <Text style={[
                          styles.dropdownText,
                          !selectedTransactionCategory && styles.dropdownPlaceholderText
                        ]}>
                          {selectedTransactionCategory || "Select transaction category"}
                        </Text>
                        <ChevronDown 
                          size={20} 
                          color={theme.colors.textSecondary}
                          style={[
                            styles.dropdownIcon,
                            showCategoryDropdown && styles.dropdownIconRotated
                          ]}
                        />
                      </TouchableOpacity>
                      
                      {showCategoryDropdown && (
                        <View style={styles.dropdownList}>
                          <ScrollView 
                            style={styles.dropdownScrollView}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                          >
                            {transactionCategories.map((category) => (
                              <TouchableOpacity
                                key={category}
                                style={[
                                  styles.dropdownItem,
                                  selectedTransactionCategory === category && styles.dropdownItemSelected
                                ]}
                                onPress={() => {
                                  setSelectedTransactionCategory(category);
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                <Text style={[
                                  styles.dropdownItemText,
                                  selectedTransactionCategory === category && styles.dropdownItemTextSelected
                                ]}>
                                  {category}
                                </Text>
                                {selectedTransactionCategory === category && (
                                  <Check size={16} color={theme.colors.primary} />
                                )}
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    {/* Icon Selection */}
                    <View style={styles.selectionGroup}>
                      <Text style={styles.selectionLabel}>Choose Icon</Text>
                      <View style={styles.iconGrid}>
                        {icons.map((iconName) => {
                          const IconComponent = iconMap[iconName];
                          return (
                            <TouchableOpacity
                              key={iconName}
                              style={[
                                styles.iconOption,
                                selectedIcon === iconName && styles.iconOptionSelected
                              ]}
                              onPress={() => setSelectedIcon(iconName)}
                            >
                              <IconComponent size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Color Selection */}
                    <View style={styles.selectionGroup}>
                      <Text style={styles.selectionLabel}>Choose Color</Text>
                      <View style={styles.colorGrid}>
                        {colors.map((color) => (
                          <TouchableOpacity
                            key={color}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                              selectedColor === color && styles.colorOptionSelected
                            ]}
                            onPress={() => setSelectedColor(color)}
                          />
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setShowAddModal(false);
                        setShowCategoryDropdown(false);
                      }}
                      variant="outline"
                      style={styles.modalButton}
                    />
                    <Button
                      title="Create Category"
                      onPress={handleAddCategory}
                      style={[
                        styles.modalButton,
                        (!newCategoryName || !newCategoryLimit || !selectedTransactionCategory) && styles.modalButtonDisabled
                      ]}
                      disabled={!newCategoryName || !newCategoryLimit || !selectedTransactionCategory}
                    />
                  </View>
                </ScrollView>
              </Animated.View>
            </Animated.View>
          </Modal>
        </SafeAreaView>
      </Animated.View>
    </View>
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.small,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 40,
    flexGrow: 1,
  },
  scrollContentEmpty: {
    justifyContent: "center",
    minHeight: 500,
  },
  summaryCard: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.1)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  summaryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTitle: {
    ...theme.typography.h4,
    fontWeight: "700",
    marginLeft: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: "700",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: theme.spacing.sm,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  statAmount: {
    ...theme.typography.h4,
    fontWeight: "700",
  },
  overallProgress: {
    marginTop: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  progressBarContainer: {
    marginTop: theme.spacing.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  categoriesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "700",
    marginLeft: theme.spacing.sm,
  },
  categoryCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxl + 10,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderStyle: "dashed",
  },
  emptyContent: {
    alignItems: "center",
    maxWidth: 280,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    minWidth: 160,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.cardElevated,
    borderRadius: theme.borderRadius.xl,
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    ...theme.shadows.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: theme.spacing.xl,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  modalForm: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  modalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  selectionGroup: {
    marginBottom: theme.spacing.lg,
  },
  selectionLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#FFFFFF",
    ...theme.shadows.small,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: theme.spacing.md,
  },
  dropdownPlaceholder: {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dropdownText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownPlaceholderText: {
    color: theme.colors.textSecondary,
  },
  dropdownIcon: {
    marginLeft: theme.spacing.sm,
    transform: [{ rotate: "0deg" }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownScrollView: {
    maxHeight: 150,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primary + "20",
  },
  dropdownItemText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});