import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { theme } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text" | "error" | "glass";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  leftIcon,
}: ButtonProps) {
  // REMOVED ALL ANIMATION CODE - buttons are now static with only glow effect
  
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [styles.primaryButton, theme.shadows.medium];
      case "secondary":
        return [styles.secondaryButton, theme.shadows.small];
      case "outline":
        return styles.outlineButton;
      case "text":
        return styles.textButton;
      case "error":
        return [styles.errorButton, theme.shadows.medium];
      case "glass":
        return [styles.glassButton, theme.shadows.medium];
      default:
        return [styles.primaryButton, theme.shadows.medium];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "text":
        return styles.textButtonText;
      case "error":
        return styles.errorText;
      case "glass":
        return styles.glassText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButton;
      case "medium":
        return styles.mediumButton;
      case "large":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallText;
      case "medium":
        return styles.mediumText;
      case "large":
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          getSizeStyle(),
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" || variant === "error" ? "#121212" : theme.colors.primary}
            size="small"
          />
        ) : (
          <React.Fragment>
            {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
            <Text
              style={[
                styles.text,
                getTextStyle(),
                getTextSizeStyle(),
                disabled && styles.disabledText,
                (icon || leftIcon) && styles.textWithIcon,
                textStyle,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
          </React.Fragment>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    // This ensures the button doesn't expand beyond its parent
    alignSelf: "stretch",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    position: "relative",
    overflow: "hidden",
    minWidth: 92, // Increased by 2px from 90
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15, // Increased by 2px from 13
  },
  textWithIcon: {
    marginHorizontal: 6, // Increased by 2px from 4
  },
  iconContainer: {
    marginLeft: 6, // Increased by 2px from 4
  },
  leftIconContainer: {
    marginRight: 6, // Increased by 2px from 4
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  primaryText: {
    color: "#121212",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  textButton: {
    backgroundColor: "transparent",
  },
  textButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  errorButton: {
    backgroundColor: theme.colors.error,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  glassButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
  },
  glassText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  smallButton: {
    paddingVertical: 8, // Increased by 2px from 6
    paddingHorizontal: 12, // Increased by 2px from 10
    minHeight: 32, // Increased by 2px from 30
  },
  smallText: {
    fontSize: 14, // Increased by 2px from 12
    fontWeight: "600",
  },
  mediumButton: {
    paddingVertical: 10, // Increased by 2px from 8
    paddingHorizontal: 16, // Increased by 2px from 14
    minHeight: 42, // Increased by 2px from 40
  },
  mediumText: {
    fontSize: 15, // Increased by 2px from 13
    fontWeight: "600",
  },
  largeButton: {
    paddingVertical: 12, // Increased by 2px from 10
    paddingHorizontal: 18, // Increased by 2px from 16
    minHeight: 50, // Increased by 2px from 48
  },
  largeText: {
    fontSize: 16, // Increased by 2px from 14
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.6,
  },
});