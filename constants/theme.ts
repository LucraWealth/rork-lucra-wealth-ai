import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const theme = {
  colors: {
    primary: colors.primary || "#4AE3A8",
    background: colors.background || "#121212",
    card: colors.card || "#1E1E1E",
    text: colors.text || "#FFFFFF",
    textSecondary: colors.textSecondary || "#A0A0A0",
    border: colors.border || "#2A2A2A",
    error: colors.error || "#FF6B6B",
    success: colors.success || "#4AE3A8",
    warning: colors.warning || "#FFD166",
    info: colors.info || "#4A8FE7",
    overlay: colors.overlay || "rgba(0, 0, 0, 0.5)",
    buttonText: colors.buttonText || "#FFFFFF",
    placeholder: colors.placeholder || "#666666",
    // Modern additions
    cardElevated: "#252525",
    surfaceHigh: "#2A2A2A",
    surfaceMid: "#1F1F1F",
    glassBackground: "rgba(30, 30, 30, 0.8)",
    primaryGradient: ["#4AE3A8", "#3BC995"],
    cardGradient: ["#1E1E1E", "#252525"],
    shadowColor: "#000000",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    medium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    large: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    glow: {
      shadowColor: "#4AE3A8",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "600",
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400",
      color: "#FFFFFF",
    },
    bodyLarge: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "500",
      color: "#FFFFFF",
    },
    bodyMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
      color: "#FFFFFF",
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "400",
      color: "#FFFFFF",
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "400",
      color: "#A0A0A0",
    },
  },
  animations: {
    fast: 150,
    medium: 250,
    slow: 350,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  cardModern: {
    backgroundColor: theme.colors.cardElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.1)",
    ...theme.shadows.small,
  },
  text: {
    color: theme.colors.text,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  glassMorphism: {
    backgroundColor: theme.colors.glassBackground,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
  },
});

export default theme;