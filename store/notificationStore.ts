import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationType = 
  | "transaction" 
  | "bill" 
  | "security" 
  | "system" 
  | "reminder" 
  | "alert" 
  | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoute?: string;
}

export interface NotificationSettings {
  pushTransactions: boolean;
  pushBills: boolean;
  pushSecurity: boolean;
  pushTokens: boolean;
  pushMarketing: boolean;
  emailTransactions: boolean;
  emailBills: boolean;
  emailSecurity: boolean;
  emailStatements: boolean;
  emailMarketing: boolean;
}

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  
  // Actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  toggleNotificationSetting: (key: keyof NotificationSettings, value: boolean) => void;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "transaction",
    title: "Payment Received",
    message: "You received $50.00 from Sarah Johnson",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    targetRoute: "/transaction/tx123",
  },
  {
    id: "2",
    type: "bill",
    title: "Upcoming Bill",
    message: "Your Netflix subscription ($14.99) is due in 2 days",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: true,
    targetRoute: "/bill/bill123",
  },
  {
    id: "3",
    type: "security",
    title: "New Login",
    message: "New login detected from San Francisco, CA",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: false,
    targetRoute: "/security",
  },
  {
    id: "4",
    type: "system",
    title: "App Update Available",
    message: "A new version of the app is available. Please update.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true,
  },
  {
    id: "5",
    type: "transaction",
    title: "Payment Sent",
    message: "You sent $25.00 to John Smith",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    read: true,
    targetRoute: "/transaction/tx456",
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: mockNotifications,
      settings: {
        pushTransactions: true,
        pushBills: true,
        pushSecurity: true,
        pushTokens: false,
        pushMarketing: false,
        emailTransactions: true,
        emailBills: true,
        emailSecurity: true,
        emailStatements: true,
        emailMarketing: false,
      },
      
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
          ...notificationData,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));
      },
      
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        }));
      },
      
      clearAllNotifications: () => {
        set({ notifications: [] });
      },
      
      toggleNotificationSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);