import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Check, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react-native";
import { theme } from "@/constants/theme";

const SettlementSuccessScreen = () => {
  const params = useLocalSearchParams<{
    contactName: string;
    amount: string;
    type: 'sent' | 'received';
    expenseTitle?: string;
  }>();
  
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const isReceived = params.type === 'received';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              backgroundColor: isReceived ? theme.colors.success : theme.colors.primary,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {isReceived ? (
            <ArrowUpRight size={48} color={theme.colors.background} />
          ) : (
            <ArrowDownLeft size={48} color={theme.colors.background} />
          )}
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>
            {isReceived ? 'Payment Received!' : 'Payment Sent!'}
          </Text>
          <Text style={styles.amount}>
            ${params.amount}
          </Text>
          <Text style={styles.subtitle}>
            {isReceived 
              ? `You received $${params.amount} from ${params.contactName}`
              : `You sent $${params.amount} to ${params.contactName}`
            }
          </Text>
          {params.expenseTitle && (
            <Text style={styles.expenseTitle}>
              for "{params.expenseTitle}"
            </Text>
          )}
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
      <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/add-expense-step-1')}
        >
          <Plus size={20} color={theme.colors.background} />
          <Text style={styles.primaryButtonText}>Add Another Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/shared-expenses')}
        >
          <Text style={styles.secondaryButtonText}>Back to Split</Text>
        </TouchableOpacity>
        

      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  secondaryButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
});

export default SettlementSuccessScreen;