import React, { useEffect, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Image 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { Check, Home, Share2 } from "lucide-react-native";
import Button from "@/components/Button";
import TokenIcon from "@/components/TokenIcon";

export default function LiquidityRemoveSuccessScreen() {
  const router = useRouter();
  const { id, token1Amount, token1Symbol, token2Amount, token2Symbol } = useLocalSearchParams();
  
  const token1Value = typeof token1Amount === "string" ? parseFloat(token1Amount) : 0;
  const token2Value = typeof token2Amount === "string" ? parseFloat(token2Amount) : 0;
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = () => {
    // Implement share functionality
    console.log("Share liquidity receipt");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.successCircle,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Check size={60} color="#121212" />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.title}>Liquidity Removed!</Text>
          
          <Text style={styles.description}>
            You have successfully removed liquidity from the {token1Symbol || "LCRA"}-{token2Symbol || "USDC"} pool.
          </Text>
        </Animated.View>
        
        <Animated.View
          style={[
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
              width: "100%",
            }
          ]}
        >
          
          <View style={styles.tokensContainer}>

            

          </View>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pool</Text>
              <Text style={styles.detailValue}>{token1Symbol || "LCRA"}-{token2Symbol || "USDC"}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Removed</Text>
              <Text style={styles.detailValue}>100%</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
      
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      > 
        <View style={styles.buttonColumn}>
          <Button
            title="View Pool"
            onPress={() => router.push(`/liquidity-pool/${id}`)}
            variant="outline"
            size="large"
            style={styles.fullWidthButton}
          />
          <Button
            title="Go to Home"
            onPress={() => router.push("/(tabs)")}
            variant="primary"
            size="large"
            style={styles.fullWidthButton}
            leftIcon={<Home size={18} color="#fff" />}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
    textAlign: "center",
    color: theme.colors.text,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    // marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  receivedText: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  tokensContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  tokenCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  tokenAmount: {
    ...theme.typography.h4,
    fontWeight: "700",
    marginVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  tokenSymbol: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: theme.spacing.sm,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  buttonColumn: {
    flexDirection: "column",
    gap: theme.spacing.md,
  },
  fullWidthButton: {
    width: "100%",
  },
});