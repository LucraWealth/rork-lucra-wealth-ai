import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Linking,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  FileText,
  Lock,
  ExternalLink,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [faceIdEnabled, setFaceIdEnabled] = React.useState(false);
  
  // Screen entry animation
  const screenFadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Screen entry animation
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    router.push("/logout-confirm");
  };

  
  const openExternalLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Cannot open URL: ${url}`);
    }
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderExternalLinkItem = (
    icon: React.ReactNode,
    title: string,
    url: string
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => openExternalLink(url)}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <ExternalLink size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSwitchItem = (
    icon: React.ReactNode,
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#3e3e3e", true: "rgba(74, 227, 168, 0.5)" }}
        thumbColor={value ? theme.colors.primary : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.View style={{ flex: 1, opacity: screenFadeAnim }}>
        <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
          <StatusBar style="light" />
          
          {/* Custom Header - Same as Notifications Screen */}
          <View style={styles.header}>
            <View style={{ width: 40 }} />
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/notification-settings")}
            >
              <Bell size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/edit-profile")}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>CUSTOMER SUPPORT</Text>
              
              <View style={styles.lucraInfoContainer}>
                <Text style={styles.lucraInfoTitle}>What is Lucra?</Text>
                <Text style={styles.lucraInfoDescription}>
                  Lucra empowers you to take control of your finances with the latest in financial technology. 
                  Our platform effortlessly integrates cryptocurrency and fiat, giving you a smooth and intuitive 
                  experience every time.
                </Text>
                <TouchableOpacity 
                  style={styles.lucraInfoButton}
                  onPress={() => openExternalLink("https://www.lucrawealth.com/")}
                >
                  <Text style={styles.lucraInfoButtonText}>Visit our website for more info</Text>
                  <ExternalLink size={16} color={theme.colors.text} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
              
              {renderExternalLinkItem(
                <Shield size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />,
                "Privacy Notice",
                "https://www.termsfeed.com/live/a25758b6-37d2-459b-a7ee-688322a7c2f3"
              )}
              
              {renderExternalLinkItem(
                <FileText size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />,
                "User Agreement",
                "https://app.websitepolicies.com/policies/view/774en42d"
              )}
              
              {renderMenuItem(
                <HelpCircle size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />,
                "Contact Us",
                () => router.push("/help")
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>PREFERENCES</Text>
              
              {renderSwitchItem(
                <Bell size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />,
                "Notifications",
                notificationsEnabled,
                setNotificationsEnabled
              )}
              
              {renderSwitchItem(
                <User size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />,
                "Face ID",
                faceIdEnabled,
                setFaceIdEnabled
              )}
              
              {renderMenuItem(
                <Lock size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />,
                "Passcode Settings",
                () => router.push("/security")
              )}
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </ScrollView>
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
  // Custom Header Styles - Copied from notification-settings.tsx
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  editButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  editButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  sectionContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: theme.spacing.md,
  },
  menuItemTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  signOutButton: {
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  signOutText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  version: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  lucraInfoContainer: {
    backgroundColor: "rgba(74, 227, 168, 0.05)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  lucraInfoTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: "600",
  },
  lucraInfoDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  lucraInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  lucraInfoButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: "500",
  },
});