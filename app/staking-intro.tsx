import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { ArrowLeft, TrendingUp, Clock, AlertTriangle, ChevronRight, Info } from "lucide-react-native";

export default function StakingIntroScreen() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  
  const handleContinue = () => {
    if (!showWarning) {
      setShowWarning(true);
    } else {
      router.push("/staking-options");
    }
  };
  
  const handleBack = () => {
    if (showWarning) {
      setShowWarning(false);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showWarning ? "Staking Disclaimer" : "What is Staking?"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!showWarning ? (
          // Staking Introduction
          <>
            <View style={styles.illustrationContainer}>
              <View style={styles.illustration}>
                <View style={styles.percentCircle}>
                  <TrendingUp size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.barChart}>
                  <View style={[styles.bar, { height: 40, backgroundColor: '#4A8FE7' }]} />
                  <View style={[styles.bar, { height: 60, backgroundColor: '#4A8FE7' }]} />
                  <View style={[styles.bar, { height: 80, backgroundColor: '#4A8FE7' }]} />
                  <View style={[styles.bar, { height: 100, backgroundColor: theme.colors.primary }]}>
                    <View style={styles.arrowUp}>
                      <TrendingUp size={16} color={theme.colors.background} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            
            <Text style={styles.title}>Stake to earn up to 18.0% APY</Text>
            
            <View style={styles.infoItem}>
              <TrendingUp size={24} color={theme.colors.text} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Don't let your crypto sit around</Text>
                <Text style={styles.infoDescription}>
                  Staking is good for long term growth. Earn passive income on your crypto assets.
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <AlertTriangle size={24} color={theme.colors.text} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Staking carries additional risks</Text>
                <Text style={styles.infoDescription}>
                  Beyond those of owning crypto. Market volatility, validator risks, and more.
                </Text>
                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Learn more</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={24} color={theme.colors.text} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Staked crypto must be unstaked to be traded</Text>
                <Text style={styles.infoDescription}>
                  Unstaking times vary from 2 to 30 days depending on the asset and network.
                </Text>
                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Learn more</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.stakingInfoCard}>
              <View style={styles.stakingInfoContent}>
                <Text style={styles.stakingInfoTitle}>What is staking?</Text>
                <Text style={styles.stakingInfoDescription}>
                  It's safe, easy, and popular. Staking is a way to earn rewards for holding certain cryptocurrencies.
                </Text>
              </View>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=200" }} 
                style={styles.stakingInfoImage}
              />
            </View>
          </>
        ) : (
          // Staking Warning/Disclaimer
          <View style={styles.warningContainer}>
            <View style={styles.warningHeader}>
              <AlertTriangle size={32} color={theme.colors.warning} />
              <Text style={styles.warningTitle}>
                Do you understand that staked assets are not available to trade immediately?
              </Text>
            </View>
            
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                Staking is a great way to earn you rewards! While assets are staked, you can't trade or transfer them.
              </Text>
              
              <Text style={styles.warningText}>
                Unstaking your eligible assets may take between 2 and 30 days.
              </Text>
              
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn more</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.stakingDetails}>
              <View style={styles.stakingDetailRow}>
                <Text style={styles.stakingDetailLabel}>Earning rate</Text>
                <Text style={styles.stakingDetailValue}>Up to 18.0% APY</Text>
              </View>
              
              <View style={styles.stakingDetailRow}>
                <Text style={styles.stakingDetailLabel}>Earning wait time</Text>
                <Text style={styles.stakingDetailValue}>1 day</Text>
              </View>
              
              <View style={styles.stakingDetailRow}>
                <Text style={styles.stakingDetailLabel}>Payout frequency</Text>
                <Text style={styles.stakingDetailValue}>Every 3 days</Text>
              </View>
              
              <View style={styles.stakingDetailRow}>
                <Text style={styles.stakingDetailLabel}>Unstaking wait time</Text>
                <Text style={styles.stakingDetailValue}>About 13 days</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        {showWarning ? (
          <>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContinue}
            >
              <Text style={styles.primaryButtonText}>I understand, start earning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>No, I don't want to stake</Text>
            </TouchableOpacity>
            
            <Text style={styles.disclaimerText}>
              By clicking "I understand", you accept the risks of staking.
            </Text>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  illustrationContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.xl,
  },
  illustration: {
    width: 200,
    height: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  percentCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
  },
  bar: {
    width: 20,
    marginHorizontal: 4,
    borderTopLeftRadius: theme.borderRadius.sm,
    borderTopRightRadius: theme.borderRadius.sm,
  },
  arrowUp: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 4,
  },
  title: {
    ...theme.typography.h2,
    fontWeight: "700",
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  infoIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  learnMoreButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  learnMoreText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  stakingInfoCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    overflow: "hidden",
  },
  stakingInfoContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  stakingInfoTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 4,
  },
  stakingInfoDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  stakingInfoImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  primaryButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.background,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  secondaryButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: "600",
  },
  disclaimerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  warningContainer: {
    marginTop: theme.spacing.lg,
  },
  warningHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  warningTitle: {
    ...theme.typography.h3,
    fontWeight: "700",
    textAlign: "center",
    marginTop: theme.spacing.md,
  },
  warningContent: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  stakingDetails: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  stakingDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  stakingDetailLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  stakingDetailValue: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
  },
});