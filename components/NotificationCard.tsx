import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";
import { Notification } from "@/store/notificationStore";
import {
  Bell,
  CreditCard,
  ShieldAlert,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
} from "lucide-react-native";

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

export default function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "transaction":
        return <Wallet size={20} color={theme.colors.primary} />;
      case "bill":
        return <CreditCard size={20} color={theme.colors.warning} />;
      case "security":
        return <ShieldAlert size={20} color={theme.colors.error} />;
      case "system":
        return <Info size={20} color={theme.colors.info} />;
      case "reminder":
        return <Clock size={20} color={theme.colors.warning} />;
      case "alert":
        return <AlertTriangle size={20} color={theme.colors.error} />;
      case "success":
        return <CheckCircle size={20} color={theme.colors.success} />;
      default:
        return <Bell size={20} color={theme.colors.primary} />;
    }
  };

  // Format date to be more readable
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.unreadContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.timestamp}>{formatDate(notification.timestamp)}</Text>
      </View>
      {!notification.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  unreadContainer: {
    backgroundColor: "rgba(74, 227, 168, 0.05)",
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
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: 2,
    color: "#FFFFFF", // White text
  },
  message: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    alignSelf: "center",
  },
});