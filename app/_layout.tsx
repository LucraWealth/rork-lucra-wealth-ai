import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, Platform, View } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: Platform.OS !== 'web',
              gestureDirection: 'horizontal',
              presentation: 'card',
              contentStyle: { backgroundColor: theme.colors.background },
              animationDuration: 250,
            }}
          >
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }
              }} 
            />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="send-money" options={{ headerShown: false }} />
            <Stack.Screen name="token-swap" options={{ headerShown: false }} />
            <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="token/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="bill/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="send-success" options={{ headerShown: false }} />
            <Stack.Screen name="swap-success" options={{ headerShown: false }} />
            <Stack.Screen name="payment-success" options={{ headerShown: false }} />
            <Stack.Screen name="card-details" options={{ headerShown: false }} />
            <Stack.Screen name="staking/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="staking-options" options={{ headerShown: false }} />
            <Stack.Screen name="add-token" options={{ headerShown: false }} />
            <Stack.Screen name="monthly-spending" options={{ headerShown: false }} />
            <Stack.Screen name="add-bill" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
            <Stack.Screen name="buy-token/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="sell-token/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="buy-success" options={{ headerShown: false }} />
            <Stack.Screen name="lina-chat" options={{ headerShown: false }} />
            <Stack.Screen name="sell-success" options={{ headerShown: false }} />
            <Stack.Screen name="personal-info" options={{ headerShown: false }} />
            <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
            <Stack.Screen name="add-payment-method" options={{ headerShown: false }} />
            <Stack.Screen name="edit-payment-method" options={{ headerShown: false }} />
            <Stack.Screen name="security" options={{ headerShown: false }} />
            <Stack.Screen name="help" options={{ headerShown: false }} />
            <Stack.Screen name="logout-confirm" options={{ headerShown: false }} />
            <Stack.Screen name="stake-more" options={{ headerShown: false }} />
            <Stack.Screen name="unstake" options={{ headerShown: false }} />
            <Stack.Screen name="stake-success" options={{ headerShown: false }} />
            <Stack.Screen name="unstake-success" options={{ headerShown: false }} />
            <Stack.Screen name="add-money" options={{ headerShown: false }} />
            <Stack.Screen name="add-money-success" options={{ headerShown: false }} />
            <Stack.Screen name="request-money" options={{ headerShown: false }} />
            <Stack.Screen name="request-success" options={{ headerShown: false }} />
            <Stack.Screen name="add-contact" options={{ headerShown: false }} />
            <Stack.Screen name="cashback" options={{ headerShown: false }} />
            <Stack.Screen name="void-cheque" options={{ headerShown: false }} />
            <Stack.Screen name="paper-statements" options={{ headerShown: false }} />
            <Stack.Screen name="card-request" options={{ headerShown: false }} />
            <Stack.Screen name="card-request-success" options={{ headerShown: false }} />
            <Stack.Screen name="dispute-charges" options={{ headerShown: false }} />
            <Stack.Screen name="cashback-success" options={{ headerShown: false }} />
            <Stack.Screen name="cashback-withdraw" options={{ headerShown: false }} />
            <Stack.Screen name="redeem-cashback" options={{ headerShown: false }} />
            <Stack.Screen name="redeem-cashback-amount" options={{ headerShown: false }} />
            <Stack.Screen name="redeem-cashback-method" options={{ headerShown: false }} />
            <Stack.Screen name="redeem-cashback-success" options={{ headerShown: false }} />
            <Stack.Screen name="liquidity-pools" options={{ headerShown: false }} />
            <Stack.Screen name="liquidity-pool/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="liquidity-add-success" options={{ headerShown: false }} />
            <Stack.Screen name="liquidity-remove-success" options={{ headerShown: false }} />
            <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
            <Stack.Screen name="bill-payment-confirm" options={{ headerShown: false }} />
            <Stack.Screen name="expense-category/[category]" options={{ headerShown: false }} />
          </Stack>
        </View>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}