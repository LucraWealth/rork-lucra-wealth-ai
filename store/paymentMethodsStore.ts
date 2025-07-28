import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PaymentMethod {
  id: string;
  name: string;
  lastFour: string;
  expiry: string;
  type: string;
  isDefault: boolean;
}

interface PaymentMethodsState {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultMethod: (id: string) => void;
}

export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  persist(
    (set) => ({
      paymentMethods: [
        {
          id: "1",
          name: "John Doe",
          lastFour: "4242",
          expiry: "12/25",
          type: "visa",
          isDefault: true,
        },
        {
          id: "2",
          name: "John Doe",
          lastFour: "5678",
          expiry: "10/24",
          type: "mastercard",
          isDefault: false,
        },
      ],

      addPaymentMethod: (method) => {
        set((state) => {
          const newMethod = {
            id: Date.now().toString(),
            ...method,
          };

          // If this is the first payment method or isDefault is true,
          // make it the default and ensure others are not default
          if (state.paymentMethods.length === 0 || method.isDefault) {
            return {
              paymentMethods: [
                ...state.paymentMethods.map((m) => ({ ...m, isDefault: false })),
                newMethod,
              ],
            };
          }

          return {
            paymentMethods: [...state.paymentMethods, newMethod],
          };
        });
      },

      updatePaymentMethod: (id, updates) => {
        set((state) => {
          // If setting this method as default, ensure others are not default
          if (updates.isDefault) {
            return {
              paymentMethods: state.paymentMethods.map((method) => {
                if (method.id === id) {
                  return { ...method, ...updates };
                }
                return { ...method, isDefault: false };
              }),
            };
          }

          // Otherwise, just update the specified method
          return {
            paymentMethods: state.paymentMethods.map((method) =>
              method.id === id ? { ...method, ...updates } : method
            ),
          };
        });
      },

      removePaymentMethod: (id) => {
        set((state) => {
          const methodToRemove = state.paymentMethods.find((m) => m.id === id);
          const filteredMethods = state.paymentMethods.filter((m) => m.id !== id);

          // If the removed method was default and there are other methods,
          // make the first remaining method the default
          if (methodToRemove?.isDefault && filteredMethods.length > 0) {
            return {
              paymentMethods: [
                { ...filteredMethods[0], isDefault: true },
                ...filteredMethods.slice(1),
              ],
            };
          }

          return {
            paymentMethods: filteredMethods,
          };
        });
      },

      setDefaultMethod: (id) => {
        set((state) => ({
          paymentMethods: state.paymentMethods.map((method) => ({
            ...method,
            isDefault: method.id === id,
          })),
        }));
      },
    }),
    {
      name: "payment-methods-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);