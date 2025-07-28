import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { Home, BarChart2, ArrowUp, DollarSign, User, X, CreditCard, Wallet, Users, Send, Download, ArrowUpRight, ArrowDownRight, ArrowDownLeft } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Animated, Platform, View, TouchableOpacity, StyleSheet, Text, Dimensions } from "react-native";

export default function TabsLayout() {
  // Animation value for tab screens
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const quickActionsAnim = React.useRef(new Animated.Value(0)).current;

  // Animate when tabs are mounted
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate Quick Actions with proper cleanup
  useEffect(() => {
    Animated.timing(quickActionsAnim, {
      toValue: isQuickActionsVisible ? 1 : 0,
      duration: 300, // Reduced for snappier feel
      useNativeDriver: false,
    }).start();
  }, [isQuickActionsVisible]);

  const quickActions = [
    {
      id: 'payments',
      title: 'Payments',
      icon: CreditCard,
      route: '/payments',
      color: theme.colors.info,
    },
    {
      id: 'tokens',
      title: 'Tokens',
      icon: Wallet,
      route: '/tokens',
      color: theme.colors.warning,
    },
    {
      id: 'split',
      title: 'Split',
      icon: Users,
      route: '/shared-expenses',
      color: theme.colors.primary,
    },
    {
      id: 'send',
      title: 'Send Money',
      icon: ArrowUpRight,
      route: '/send-money',
      color: theme.colors.success,
    },
    {
      id: 'request',
      title: 'Request Money',
      icon: ArrowDownLeft,
      route: '/request-money',
      color: theme.colors.error,
    },
  ];

  const handleActionPress = (route: string) => {
    // Close modal immediately, then navigate
    setIsQuickActionsVisible(false);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push(route as any);
    }, 400); // Match animation duration
  };

  const toggleQuickActions = () => {
    setIsQuickActionsVisible(!isQuickActionsVisible);
  };

  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    // Calculate dynamic height based on content
    const quickActionsHeight = quickActionsAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 320], // Increased to show all 5 options
    });

    const quickActionsOpacity = quickActionsAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    // Add scale animation for smoother feel
    const quickActionsScale = quickActionsAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    });

    return (
      <View style={styles.tabBarContainer}>
        {/* Quick Actions Panel - Only render when visible or animating */}
        {(isQuickActionsVisible) && (
          <Animated.View style={[
            styles.quickActionsPanel, 
            { 
              height: quickActionsHeight,
              opacity: quickActionsOpacity,
              transform: [{ scale: quickActionsScale }],
            }
          ]}>
            <View style={styles.quickActionsContent}>
              <View style={styles.actionsGrid}>
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  
                  // Add staggered animation for each action item
                  const actionOpacity = quickActionsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  });
                  
                  const actionTranslateY = quickActionsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0], // Reduced from 20 to 10
                  });

                  return (
                    <Animated.View
                      key={action.id}
                      style={{
                        opacity: actionOpacity,
                        transform: [{ translateY: actionTranslateY }],
                      }}
                    >
                      <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => handleActionPress(action.route)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                          <IconComponent size={20} color={action.color} />
                        </View>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}
        
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
            const isFocused = state.index === index;
            
            // Center button (index 2)
            if (index === 2) {
              // Add rotation animation for the center button
              const centerButtonRotation = quickActionsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg'],
              });

              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.centerButton}
                  onPress={toggleQuickActions}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[
                    styles.centerButtonInner, 
                    isQuickActionsVisible && styles.centerButtonActive,
                    { transform: [{ rotate: centerButtonRotation }] }
                  ]}>
                    <Animated.View style={{ transform: [{ rotate: centerButtonRotation }] }}>
                      {isQuickActionsVisible ? (
                        <X size={24} color={theme.colors.text} />
                      ) : (
                        <ArrowUp size={24} color={theme.colors.text} />
                      )}
                    </Animated.View>
                  </Animated.View>
                </TouchableOpacity>
              );
            }
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              
              if (!isFocused && !event.defaultPrevented) {
                // Close quick actions if open when navigating to other tabs
                if (isQuickActionsVisible) {
                  setIsQuickActionsVisible(false);
                }
                navigation.navigate(route.name);
              }
            };
            
            const IconComponent = getTabIcon(route.name);
            const color = isFocused ? theme.colors.primary : theme.colors.textSecondary;
            
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <IconComponent size={22} color={color} />
                <Text style={[styles.tabLabel, { color }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  const getTabIcon = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return Home;
      case 'transactions':
        return BarChart2;
      case 'cashback':
        return DollarSign;
      case 'profile':
        return User;
      default:
        return Home;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'web' ? 'none' : 'fade',
            lazy: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: "Transactions",
            }}
          />
          {/* Placeholder for center button */}
          <Tabs.Screen
            name="payments"
            options={{
              title: "",
              href: null, // This makes it not navigable
            }}
          />
          <Tabs.Screen
            name="cashback"
            options={{
              title: "Cashback",
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
            }}
          />
          {/* Hide these screens from tabs */}
          <Tabs.Screen
            name="tokens"
            options={{
              title: "",
              href: null,
            }}
          />
          <Tabs.Screen
            name="shared-expenses"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 12,
    ...theme.shadows.small,
    position: 'relative',
  },
  quickActionsPanel: {
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  quickActionsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    minHeight: 280, // Adjusted to fit all content
  },
  quickActionsHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionsTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
  },
  actionsGrid: {
    gap: theme.spacing.xs,
    flex: 1,
    paddingBottom: theme.spacing.sm, // Add bottom padding
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // Reduced from 16
    backgroundColor: theme.colors.surfaceMid,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 6, // Reduced from 8
  },
  actionIconContainer: {
    width: 26, // Reduced from 40
    height: 26, // Reduced from 40
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5, // Reduced from 16
  },
  actionTitle: {
    ...theme.typography.bodyMedium,
    fontSize: 14, // Slightly smaller
    flex: 1,
    color: theme.colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  centerButtonActive: {
    backgroundColor: theme.colors.textSecondary,
    shadowColor: theme.colors.textSecondary,
  },
});