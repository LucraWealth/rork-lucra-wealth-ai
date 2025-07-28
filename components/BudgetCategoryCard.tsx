import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, Animated } from "react-native";
import { theme } from "@/constants/theme";
import { BudgetCategory } from "@/store/walletStore";
import { Edit3, Trash2, AlertTriangle, DollarSign, Zap, Coffee, Music, Car, ShoppingBag, Heart, Check, X, ChevronRight } from "lucide-react-native";
import Card from "./Card";
import BudgetProgressBar from "./BudgetProgressBar";

const iconMap: Record<string, any> = {
  Zap,
  Coffee,
  Music,
  Car,
  ShoppingBag,
  Heart,
  DollarSign,
};

interface BudgetCategoryCardProps {
  category: BudgetCategory;
  onEdit: (categoryId: string, newLimit: number) => void;
  onDelete: (categoryId: string, categoryName: string) => void;
  onPress?: (categoryName: string) => void;
  index?: number;
}

export default function BudgetCategoryCard({
  category,
  onEdit,
  onDelete,
  onPress,
  index = 0,
}: BudgetCategoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(category.limit.toString());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const editHeightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  useEffect(() => {
    // Animate edit section
    Animated.timing(editHeightAnim, {
      toValue: isEditing ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isEditing]);

  const IconComponent = iconMap[category.icon] || DollarSign;
  const remaining = category.limit - category.spent;
  const isOverBudget = category.spent > category.limit;
  const percentage = (category.spent / category.limit) * 100;

  const handleSave = () => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount > 0) {
      onEdit(category.id, amount);
      setIsEditing(false);
    } else {
      Alert.alert("Invalid Amount", "Please enter a valid budget amount.");
    }
  };

  const handleCancel = () => {
    setEditAmount(category.limit.toString());
    setIsEditing(false);
  };

  const handleCardPress = () => {
    if (!isEditing && onPress) {
      onPress(category.name);
    }
  };

  const getStatusColor = () => {
    if (percentage >= 100) return "#FF6B6B";
    if (percentage >= 80) return "#FFD166";
    return "#4AE3A8";
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={isEditing ? 1 : 0.7}
        disabled={isEditing}
      >
        <Card style={[styles.card, isOverBudget && styles.cardOverBudget]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryInfo}>
              <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <IconComponent size={22} color="#FFFFFF" />
              </View>
              <View style={styles.categoryDetails}>
                <Text style={styles.categoryName} numberOfLines={1} ellipsizeMode="tail">{category.name}</Text>
                <Text style={styles.categorySubtext}>
                  ${category.spent.toFixed(2)} of ${category.limit.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.actions}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              </View>
              {onPress && !isEditing && (
                <View style={styles.chevronContainer}>
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </View>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Edit3 size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(category.id, category.name)}
                disabled={isEditing}
              >
                <Trash2 size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <BudgetProgressBar
              spent={category.spent}
              limit={category.limit}
              color={category.color}
              animated={true}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {isOverBudget ? (
              <View style={styles.overBudgetContainer}>
                <AlertTriangle size={16} color="#FF6B6B" />
                <Text style={styles.overBudgetText}>
                  ${Math.abs(remaining).toFixed(2)} over budget
                </Text>
              </View>
            ) : (
              <View style={styles.remainingContainer}>
                <Text style={styles.remainingText}>
                  ${remaining.toFixed(2)} remaining
                </Text>
                <Text style={styles.remainingSubtext}>
                  {Math.round((remaining / category.limit) * 100)}% left
                </Text>
              </View>
            )}
          </View>

          {/* Edit Section */}
          <Animated.View 
            style={[
              styles.editContainer,
              {
                height: editHeightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 140],
                }),
                opacity: editHeightAnim,
              }
            ]}
          >
            <View style={styles.editContent}>
              <Text style={styles.editLabel}>New Budget Limit</Text>
              <TextInput
                style={styles.editInput}
                value={editAmount}
                onChangeText={setEditAmount}
                placeholder="Enter amount"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                autoFocus={isEditing}
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <X size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Check size={16} color={theme.colors.background} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  card: {
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: theme.colors.cardElevated,
  },
  cardOverBudget: {
    borderColor: "rgba(255, 107, 107, 0.3)",
    backgroundColor: "rgba(255, 107, 107, 0.05)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  categoryDetails: {
    flex: 1,
    minWidth: 0,
  },
  categoryName: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 4,
    numberOfLines: 1,
    flexShrink: 1,
  },
  categorySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    marginRight: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chevronContainer: {
    marginRight: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingContainer: {
    flex: 1,
  },
  remainingText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  remainingSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  overBudgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  overBudgetText: {
    ...theme.typography.bodySmall,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  editContainer: {
    overflow: "hidden",
    marginTop: theme.spacing.md,
  },
  editContent: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: theme.spacing.md,
  },
  editLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: "500",
  },
  editInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cancelButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontWeight: "500",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.small,
  },
  saveButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
});