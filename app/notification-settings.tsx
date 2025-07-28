import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import NotificationCard from "@/components/NotificationCard";
import { useNotificationStore } from "@/store/notificationStore";
import { ArrowLeft, Bell, BellOff, Settings, Trash2 } from "lucide-react-native";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { notifications, markAllAsRead, clearAllNotifications, toggleNotificationSetting, settings } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications");
  
  const handleNotificationPress = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // Mark as read
    useNotificationStore.getState().markAsRead(notificationId);
    
    // Navigate based on notification type
    if (notification.targetRoute) {
      router.push(notification.targetRoute);
    } else {
      switch (notification.type) {
        case 'transaction':
          router.push("/(tabs)/transactions");
          break;
        case 'bill':
          router.push("/(tabs)/payments");
          break;
        case 'security':
          router.push("/security");
          break;
        case 'system':
          router.push("/(tabs)/profile");
          break;
        default:
          // Stay on the current screen
          break;
      }
    }
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
  };
  
  const renderNotificationsTab = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsContainer}
      >
        <View style={styles.notificationActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMarkAllAsRead}
          >
            <Bell size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Mark All as Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearAll}
          >
            <Trash2 size={16} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
        
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <BellOff size={32} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyDescription}>
              You don't have any notifications at the moment
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };
  
  const renderSettingsTab = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settingsContainer}
      >
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Push Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Transaction Alerts</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive alerts for all transactions
              </Text>
            </View>
            <Switch
              value={settings.pushTransactions}
              onValueChange={(value) =>
                toggleNotificationSetting("pushTransactions", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.pushTransactions
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Bill Reminders</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive reminders for upcoming bills
              </Text>
            </View>
            <Switch
              value={settings.pushBills}
              onValueChange={(value) =>
                toggleNotificationSetting("pushBills", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.pushBills
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>

          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8, maxWidth: "75%" }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Security Alerts</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive alerts for security-related events
              </Text>
            </View>
            <Switch
              value={settings.pushSecurity}
              onValueChange={(value) =>
                toggleNotificationSetting("pushSecurity", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.pushSecurity
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8, maxWidth: "75%" }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Token Price Alerts</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive alerts for significant price changes
              </Text>
            </View>
            <Switch
              value={settings.pushTokens}
              onValueChange={(value) =>
                toggleNotificationSetting("pushTokens", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.pushTokens
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8, maxWidth: "75%" }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Marketing & Promotions</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive offers and promotional messages
              </Text>
            </View>
            <Switch
              value={settings.pushMarketing}
              onValueChange={(value) =>
                toggleNotificationSetting("pushMarketing", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.pushMarketing
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
        </Card>
        
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Email Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Transaction Receipts</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive email receipts for transactions
              </Text>
            </View>
            <Switch
              value={settings.emailTransactions}
              onValueChange={(value) =>
                toggleNotificationSetting("emailTransactions", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.emailTransactions
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8, maxWidth: "75%" }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Bill Reminders</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive email reminders for upcoming bills
              </Text>
            </View>
            <Switch
              value={settings.emailBills}
              onValueChange={(value) =>
                toggleNotificationSetting("emailBills", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.emailBills
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8, maxWidth: "75%" }}>
            <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Security Alerts</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive email alerts for security-related events
              </Text>
            </View>
            <Switch
              value={settings.emailSecurity}
              onValueChange={(value) =>
                toggleNotificationSetting("emailSecurity", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.emailSecurity
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8, maxWidth: "75%" }}>
            <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Monthly Statements</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive monthly account statements via email
              </Text>
            </View>
            <Switch
              value={settings.emailStatements}
              onValueChange={(value) =>
                toggleNotificationSetting("emailStatements", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.emailStatements
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.settingLabel} numberOfLines={1} ellipsizeMode="tail">Marketing & Promotions</Text>
              <Text style={styles.settingDescription} numberOfLines={2} ellipsizeMode="tail">
                Receive offers and promotional emails
              </Text>
            </View>
            <Switch
              value={settings.emailMarketing}
              onValueChange={(value) =>
                toggleNotificationSetting("emailMarketing", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : settings.emailMarketing
                    ? theme.colors.primary
                    : "#f4f3f4"
              }
            />
          </View>
        </Card>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "notifications" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("notifications")}
        >
          <Bell
            size={20}
            color={
              activeTab === "notifications"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "notifications" && styles.activeTabButtonText,
            ]}
          >
            Notifications
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "settings" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("settings")}
        >
          <Settings
            size={20}
            color={
              activeTab === "settings"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "settings" && styles.activeTabButtonText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === "notifications" ? renderNotificationsTab() : renderSettingsTab()}
      </View>
    </SafeAreaView>
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
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.xl,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  notificationsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  settingsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  actionButtonText: {
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(160, 160, 160, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  emptyDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  settingsCard: {
    marginBottom: theme.spacing.md,
  },
  settingsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  settingLabel: {
    ...theme.typography.body,
    fontWeight: "500",
    color: theme.colors.text,
  },
  settingDescription: {
    ...theme.typography.caption,
    width: "95%",
    color: theme.colors.textSecondary,
    marginTop: 2,

  },
});