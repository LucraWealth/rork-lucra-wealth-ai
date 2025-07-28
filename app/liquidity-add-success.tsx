import React, { useEffect, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Image,
  Dimensions 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { Check, Share2, Home } from "lucide-react-native";
import Button from "@/components/Button";
import TokenIcon from "@/components/TokenIcon";

const { width } = Dimensions.get("window");

export default function LiquidityAddSuccessScreen() {
  const router = useRouter();
  const { id, token1Amount, token1Symbol, token2Amount, token2Symbol } = useLocalSearchParams();
  
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

  const handleViewPool = () => {
    router.push(`/liquidity-pool/${id}`);
  };

  const handleDone = () => {
    router.push("/(tabs)");
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
          <Text style={styles.title}>Liquidity Added!</Text>
          <Text style={styles.description}>
            You have successfully added liquidity to the {token1Symbol || "LCRA"}-{token2Symbol || "USDC"} pool.
          </Text>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.detailsCard,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.poolInfo}>
            <View style={styles.tokenIcons}>
              <View style={styles.tokenIconContainer}>
                <TokenIcon 
                  symbol={token1Symbol as string || "LCRA"} 
                  size={24} 
                />
              </View>
              <View style={[styles.tokenIconContainer, styles.tokenIconOverlap]}>
                <TokenIcon 
                  symbol={token2Symbol as string || "USDC"} 
                  size={24} 
                />
              </View>
            </View>
            <Text style={styles.poolName}>{token1Symbol || "LCRA"}-{token2Symbol || "USDC"} Pool</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{token1Symbol || "LCRA"} Amount</Text>
            <Text style={styles.detailValue}>
              {token1Amount ? parseFloat(token1Amount as string).toFixed(6) : "0.00"}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{token2Symbol || "USDC"} Amount</Text>
            <Text style={styles.detailValue}>
              {token2Amount ? parseFloat(token2Amount as string).toFixed(6) : "0.00"}
            </Text>
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
            onPress={handleViewPool}
            variant="outline"
            size="large"
            style={styles.fullWidthButton}
          />
          <Button
            title="Go to Home"
            onPress={handleDone}
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
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
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
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: theme.spacing.lg,
  },
  poolInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tokenIcons: {
    flexDirection: "row",
    marginRight: theme.spacing.md,
  },
  tokenIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  tokenIconOverlap: {
    marginLeft: -15,
  },
  poolName: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: theme.spacing.sm,
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
    marginTop: theme.spacing.md,
  },
  buttonColumn: {
    flexDirection: "column",
    gap: theme.spacing.md,
  },
  fullWidthButton: {
    width: "100%",
  },
});