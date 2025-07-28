import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { theme } from "@/constants/theme";

interface BudgetProgressBarProps {
  spent: number;
  limit: number;
  color?: string;
  showPercentage?: boolean;
  height?: number;
  animated?: boolean;
}

export default function BudgetProgressBar({
  spent,
  limit,
  color = theme.colors.primary,
  showPercentage = true,
  height = 8,
  animated = true,
}: BudgetProgressBarProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(animatedWidth, {
          toValue: percentage,
          friction: 8,
          tension: 100,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedWidth.setValue(percentage);
      animatedOpacity.setValue(1);
    }
  }, [percentage, animated]);
  
  const getProgressColor = () => {
    if (percentage >= 100) return "#FF6B6B";
    if (percentage >= 80) return "#FFD166";
    return color;
  };

  const progressColor = getProgressColor();

  return (
    <Animated.View style={[styles.container, { opacity: animatedOpacity }]}>
      <View style={[styles.progressBackground, { height }]}>
        <Animated.View 
          style={[
            styles.progressFill,
            { 
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              backgroundColor: progressColor,
              height,
            }
          ]}
        />
        {/* Glow effect for high progress */}
        {percentage >= 80 && (
          <Animated.View 
            style={[
              styles.progressGlow,
              { 
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: progressColor,
                height,
                shadowColor: progressColor,
              }
            ]}
          />
        )}
      </View>
      {showPercentage && (
        <Animated.View style={styles.percentageContainer}>
          <Text style={[
            styles.percentageText,
            { color: percentage >= 80 ? progressColor : theme.colors.textSecondary }
          ]}>
            {percentage.toFixed(0)}%
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.sm,
  },
  progressBackground: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 6,
    overflow: "hidden",
    marginRight: theme.spacing.md,
    position: "relative",
  },
  progressFill: {
    borderRadius: 6,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressGlow: {
    borderRadius: 6,
    position: "absolute",
    left: 0,
    top: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  percentageContainer: {
    minWidth: 40,
    alignItems: "flex-end",
  },
  percentageText: {
    ...theme.typography.caption,
    fontWeight: "600",
    fontSize: 13,
  },
});