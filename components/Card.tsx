import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined";
}

export default function Card({ children, style, variant = "default" }: CardProps) {
  const getCardStyle = () => {
    switch (variant) {
      case "elevated":
        return styles.cardElevated;
      case "outlined":
        return styles.cardOutlined;
      default:
        return styles.card;
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    // Reduced shadow for default card
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardElevated: {
    backgroundColor: theme.colors.cardElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    // Reduced shadow for elevated card
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOutlined: {
    backgroundColor: "transparent",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});