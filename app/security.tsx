import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import { 
  Lock, 
  Smartphone, 
  Shield, 
  Fingerprint, 
  AlertTriangle,
  ChevronRight,
  LogOut,
  ArrowLeft
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useSecurityStore } from "@/store/securityStore";

export default function SecurityScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { 
    isBiometricEnabled, 
    is2FAEnabled, 
    isPinEnabled,
    toggleBiometric,
    toggle2FA,
    togglePin
  } = useSecurityStore();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChangePassword = () => {
    // Validate inputs
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Show success message
      Alert.alert(
        "Success",
        "Your password has been changed successfully",
        [{ text: "OK" }]
      );
    }, 1500);
  };
  
  const handleLogoutAllDevices = () => {
    Alert.alert(
      "Logout from All Devices",
      "Are you sure you want to log out from all devices? You will need to log in again on all your devices.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout All",
          style: "destructive",
          onPress: () => {
            // Simulate API call
            setTimeout(() => {
              Alert.alert(
                "Success",
                "You have been logged out from all devices",
                [
                  { 
                    text: "OK", 
                    onPress: () => {
                      logout();
                      router.replace("/");
                    }
                  }
                ]
              );
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <Text style={styles.sectionDescription}>
            Manage your account security settings
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          
          <TextInput
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            containerStyle={styles.input}
          />
          
          <TextInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            containerStyle={styles.input}
          />
          
          <TextInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            containerStyle={styles.input}
          />
          
          <Button
            title="Change Password"
            onPress={handleChangePassword}
            variant="primary"
            size="medium"
            loading={isLoading}
            style={styles.changePasswordButton}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Authentication</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleIcon}>
              <Smartphone size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Two-Factor Authentication</Text>
              <Text style={styles.toggleDescription}>
                Add an extra layer of security to your account
              </Text>
            </View>
            <Switch
              value={is2FAEnabled}
              onValueChange={(value) => {
                if (value) {
                  router.push("/setup-2fa");
                } else {
                  Alert.alert(
                    "Disable 2FA",
                    "Are you sure you want to disable two-factor authentication? This will make your account less secure.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Disable",
                        style: "destructive",
                        onPress: () => toggle2FA(false),
                      },
                    ]
                  );
                }
              }}
              trackColor={{ false: theme.colors.border, true: "rgba(74, 227, 168, 0.4)" }}
              thumbColor={is2FAEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleIcon}>
              <Fingerprint size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Biometric Authentication</Text>
              <Text style={styles.toggleDescription}>
                Use fingerprint or face recognition to log in
              </Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: theme.colors.border, true: "rgba(74, 227, 168, 0.4)" }}
              thumbColor={isBiometricEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleIcon}>
              <Lock size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>PIN Code</Text>
              <Text style={styles.toggleDescription}>
                Use a PIN code for quick access
              </Text>
            </View>
            <Switch
              value={isPinEnabled}
              onValueChange={(value) => {
                if (value) {
                  router.push("/setup-pin");
                } else {
                  toggle2FA(false);
                }
              }}
              trackColor={{ false: theme.colors.border, true: "rgba(74, 227, 168, 0.4)" }}
              thumbColor={isPinEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Device Management</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push("/active-sessions")}
          >
            <View style={styles.menuItemIcon}>
              <Smartphone size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Active Sessions</Text>
              <Text style={styles.menuItemDescription}>
                Manage devices where you're logged in
              </Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutAllItem]}
            onPress={handleLogoutAllDevices}
          >
            <View style={[styles.menuItemIcon, styles.logoutAllIcon]}>
              <LogOut size={20} color={theme.colors.error} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, styles.logoutAllText]}>
                Logout from All Devices
              </Text>
              <Text style={styles.menuItemDescription}>
                End all active sessions
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Security Alerts</Text>
          
          <View style={styles.alertItem}>
            <View style={styles.alertIcon}>
              <AlertTriangle size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Unusual Login Detected</Text>
              <Text style={styles.alertDescription}>
                New login from San Francisco, CA on May 15, 2023
              </Text>
              <Text style={styles.alertTime}>2 days ago</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push("/security-alerts")}
          >
            <Text style={styles.viewAllText}>View All Alerts</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
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
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
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
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  changePasswordButton: {
    marginTop: theme.spacing.sm,
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  toggleDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuItemDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  logoutAllItem: {
    borderBottomWidth: 0,
  },
  logoutAllIcon: {
    backgroundColor: "rgba(255, 69, 58, 0.1)",
  },
  logoutAllText: {
    color: theme.colors.error,
  },
  alertItem: {
    flexDirection: "row",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 204, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  alertDescription: {
    ...theme.typography.bodySmall,
    marginBottom: 2,
  },
  alertTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  viewAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "500",
  },
});