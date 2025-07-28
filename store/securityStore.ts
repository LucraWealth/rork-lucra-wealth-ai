import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SecurityState {
  isBiometricEnabled: boolean;
  is2FAEnabled: boolean;
  isPinEnabled: boolean;
  pinCode: string | null;
  activeSessions: {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  
  toggleBiometric: (enabled: boolean) => void;
  toggle2FA: (enabled: boolean) => void;
  togglePin: (enabled: boolean) => void;
  setPin: (pin: string) => void;
  removeSession: (id: string) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isBiometricEnabled: false,
      is2FAEnabled: false,
      isPinEnabled: false,
      pinCode: null,
      activeSessions: [
        {
          id: "1",
          device: "iPhone 13 Pro",
          location: "New York, USA",
          lastActive: "2023-06-15T10:30:00Z",
          isCurrent: true,
        },
        {
          id: "2",
          device: "MacBook Pro",
          location: "New York, USA",
          lastActive: "2023-06-14T18:45:00Z",
          isCurrent: false,
        },
        {
          id: "3",
          device: "iPad Air",
          location: "Boston, USA",
          lastActive: "2023-06-10T09:15:00Z",
          isCurrent: false,
        },
      ],

      toggleBiometric: (enabled) => {
        set({ isBiometricEnabled: enabled });
      },

      toggle2FA: (enabled) => {
        set({ is2FAEnabled: enabled });
      },

      togglePin: (enabled) => {
        set({ isPinEnabled: enabled });
      },

      setPin: (pin) => {
        set({ pinCode: pin, isPinEnabled: true });
      },

      removeSession: (id) => {
        set((state) => ({
          activeSessions: state.activeSessions.filter((session) => session.id !== id),
        }));
      },
    }),
    {
      name: "security-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);