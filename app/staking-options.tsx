import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Modal,
  Platform,
  Animated,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import { 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  Search, 
  AlertTriangle,
  Info,
  X,
  ChevronRight,
  BarChart2,
  Flag
} from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import Button from "@/components/Button";
import TokenIcon from "@/components/TokenIcon";

// Define the steps for the staking intro
enum StakingIntroStep {
  WHAT_IS_STAKING = 0,
  BENEFITS = 1,
  RISKS = 2,
  OPTIONS = 3
}

interface StakingOption {
  id: string;
  tokenId: string;
  name: string;
  symbol: string;
  apy: number;
  lockPeriod: number;
  minAmount: number;
  risk: "Low" | "Medium" | "High";
  iconUrl: string;
  earningWaitTime: string;
  payoutFrequency: string;
  unstakingWaitTime: string;
}

export default function StakingOptionsScreen() {
  const router = useRouter();
  const { tokens } = useWalletStore();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showStakingInfo, setShowStakingInfo] = useState(false);
  const [selectedOption, setSelectedOption] = useState<StakingOption | null>(null);
  const [currentIntroStep, setCurrentIntroStep] = useState<StakingIntroStep>(StakingIntroStep.WHAT_IS_STAKING);
  const [showIntro, setShowIntro] = useState(true);
  const windowHeight = Dimensions.get('window').height;
  
  // Animation values for modal
  const [modalAnimation] = useState(new Animated.Value(0));
  const [backdropAnimation] = useState(new Animated.Value(0));

  // Mock staking options - ensure unique IDs and no duplicates
  const stakingOptions: StakingOption[] = [
    {
      id: "eth-30",
      tokenId: "2",
      name: "Ethereum",
      symbol: "ETH",
      apy: 4.5,
      lockPeriod: 30,
      minAmount: 0.1,
      risk: "Low",
      iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025",
      earningWaitTime: "1 day",
      payoutFrequency: "Every 3 days",
      unstakingWaitTime: "About 13 days"
    },
    {
      id: "eth-90",
      tokenId: "2",
      name: "Ethereum",
      symbol: "ETH",
      apy: 6.0,
      lockPeriod: 90,
      minAmount: 0.1,
      risk: "Medium",
      iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=025",
      earningWaitTime: "1 day",
      payoutFrequency: "Every 3 days",
      unstakingWaitTime: "About 20 days"
    },
    {
      id: "btc-30",
      tokenId: "1",
      name: "Bitcoin",
      symbol: "BTC",
      apy: 3.5,
      lockPeriod: 30,
      minAmount: 0.001,
      risk: "Low",
      iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025",
      earningWaitTime: "1 day",
      payoutFrequency: "Every 3 days",
      unstakingWaitTime: "About 10 days"
    },
    {
      id: "btc-90",
      tokenId: "1",
      name: "Bitcoin",
      symbol: "BTC",
      apy: 5.0,
      lockPeriod: 90,
      minAmount: 0.001,
      risk: "Medium",
      iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=025",
      earningWaitTime: "1 day",
      payoutFrequency: "Every 3 days",
      unstakingWaitTime: "About 15 days"
    },
    {
      id: "sol-30",
      tokenId: "4",
      name: "Solana",
      symbol: "SOL",
      apy: 6.2,
      lockPeriod: 30,
      minAmount: 1,
      risk: "Medium",
      iconUrl: "https://cryptologos.cc/logos/solana-sol-logo.png?v=025",
      earningWaitTime: "1 day",
      payoutFrequency: "Every 3 days",
      unstakingWaitTime: "About 8 days"
    },
    {
      id: "sol-90",
      tokenId: "4",
      name: "Solana",
      symbol: "SOL",
      apy: 8.5,
      lockPeriod: 90,
      minAmount: 1,
      risk: "High",
      iconUrl: "https://cryptologos.cc/logos/solana-sol-logo.png?v=025",
      earningWaitTime: "1 day",
      payoutFrequency: "Every 3 days",
      unstakingWaitTime: "About 18 days"
    },
    // {
    //   id: "lcra-30",
    //   tokenId: "0",
    //   name: "Lucra",
    //   symbol: "LCRA",
    //   apy: 15.0,
    //   lockPeriod: 30,
    //   minAmount: 100,
    //   risk: "Medium",
    //   iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
    //   earningWaitTime: "1 day",
    //   payoutFrequency: "Every 3 days",
    //   unstakingWaitTime: "About 10 days"
    // },
    // {
    //   id: "lcra-90",
    //   tokenId: "0",
    //   name: "Lucra",
    //   symbol: "LCRA",
    //   apy: 18.0,
    //   lockPeriod: 90,
    //   minAmount: 100,
    //   risk: "Medium",
    //   iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
    //   earningWaitTime: "1 day",
    //   payoutFrequency: "Every 3 days",
    //   unstakingWaitTime: "About 25 days"
    // },
  ];

  // Filter options based on active filter
  const filteredOptions = () => {
    switch (activeFilter) {
      case "myTokens":
        return stakingOptions.filter(option => 
          tokens.some(token => token.id === option.tokenId && token.balance >= option.minAmount)
        );
      case "highestAPY":
        return [...stakingOptions].sort((a, b) => b.apy - a.apy);
      case "shortestLock":
        return [...stakingOptions].sort((a, b) => a.lockPeriod - b.lockPeriod);
      default:
        return stakingOptions;
    }
  };

  const renderRiskBadge = (risk: "Low" | "Medium" | "High") => {
    let color = theme.colors.success;
    if (risk === "Medium") color = theme.colors.warning;
    if (risk === "High") color = theme.colors.error;

    return (
      <View style={[styles.riskBadge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.riskText, { color }]}>{risk} Risk</Text>
      </View>
    );
  };

  const handleStakeOption = (option: StakingOption) => {
    const token = tokens.find(t => t.id === option.tokenId);
    
    if (!token) {
      return;
    }
    
    setSelectedOption(option);
    setShowStakingInfo(true);
    
    // Animate modal opening
    Animated.parallel([
      Animated.timing(backdropAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  };
  
  const closeStakingInfo = () => {
    // Animate modal closing
    Animated.parallel([
      Animated.timing(backdropAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start(() => {
      setShowStakingInfo(false);
      setSelectedOption(null);
    });
  };
  
  const handleStartStaking = () => {
    if (!selectedOption) return;
    
    closeStakingInfo();
    
    // Navigate to stake amount screen
    router.push({
      pathname: "/stake-more",
      params: { 
        id: selectedOption.id,
        tokenId: selectedOption.tokenId,
        name: selectedOption.name,
        symbol: selectedOption.symbol,
        apy: selectedOption.apy.toString(),
        lockPeriod: selectedOption.lockPeriod.toString(),
        minAmount: selectedOption.minAmount.toString(),
        earningWaitTime: selectedOption.earningWaitTime,
        payoutFrequency: selectedOption.payoutFrequency,
        unstakingWaitTime: selectedOption.unstakingWaitTime,
        isNewStake: "true"
      }
    });
  };
  
  const handleNextIntroStep = () => {
    if (currentIntroStep === StakingIntroStep.RISKS) {
      setShowIntro(false);
    } else {
      setCurrentIntroStep(currentIntroStep + 1);
    }
  };
  
  const renderStakingIntro = () => {
    switch (currentIntroStep) {
      case StakingIntroStep.WHAT_IS_STAKING:
        return (
          <View style={styles.introContainer}>
            <View style={styles.introHeader}>
              <View style={styles.introIconContainer}>
                <TrendingUp size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.introTitle}>Stake to earn up to 18.0% APY</Text>
            </View>
            
            <View style={styles.introContent}>
              <View style={styles.introItem}>
                <BarChart2 size={24} color={theme.colors.textSecondary} />
                <Text style={styles.introText}>
                  Don't let your crypto sit around. Staking is good for long term growth.
                </Text>
              </View>
              
              <View style={styles.introItem}>
                <Flag size={24} color={theme.colors.textSecondary} />
                <Text style={styles.introText}>
                  Staking carries additional risks beyond those of owning crypto.{" "}
                  <Text style={styles.learnMoreText}>Learn more</Text>
                </Text>
              </View>
              
              <View style={styles.introItem}>
                <Clock size={24} color={theme.colors.textSecondary} />
                <Text style={styles.introText}>
                  Staked crypto must be unstaked to be traded or sent. Unstaking times vary.{" "}
                  <Text style={styles.learnMoreText}>Learn more</Text>
                </Text>
              </View>
            </View>
            
            <View style={styles.introFooter}>
              <Button
                title="Continue"
                onPress={handleNextIntroStep}
                variant="primary"
                size="large"
                style={styles.continueButton}
              />
              <Text style={styles.disclaimerText}>
                By clicking "Continue", you accept the{" "}
                <Text style={styles.learnMoreText}>risks of staking</Text>.
              </Text>
            </View>
          </View>
        );
        
      case StakingIntroStep.BENEFITS:
        return (
          <View style={styles.introContainer}>
            <View style={styles.introHeader}>
              <View style={styles.introIconContainer}>
                <TrendingUp size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.introTitle}>Benefits of Staking</Text>
            </View>
            
            <View style={styles.introContent}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <TrendingUp size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>Earn Passive Income</Text>
                  <Text style={styles.benefitText}>
                    Earn rewards on your crypto holdings without having to sell them.
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Clock size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>Long-term Growth</Text>
                  <Text style={styles.benefitText}>
                    Compound your earnings over time for greater returns.
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Info size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>Support the Network</Text>
                  <Text style={styles.benefitText}>
                    Help secure and validate transactions on the blockchain.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.introFooter}>
              <Button
                title="Continue"
                onPress={handleNextIntroStep}
                variant="primary"
                size="large"
                style={styles.continueButton}
              />
            </View>
          </View>
        );
        
      case StakingIntroStep.RISKS:
        return (
          <View style={styles.introContainer}>
            <View style={styles.introHeader}>
              <View style={styles.introIconContainer}>
                <AlertTriangle size={32} color={theme.colors.warning} />
              </View>
              <Text style={styles.introTitle}>Important Considerations</Text>
            </View>
            
            <View style={styles.warningContainer}>
              <Text style={styles.warningTitle}>
                Do you understand that staked assets are not available to trade immediately?
              </Text>
              
              <Text style={styles.warningText}>
                Staking is a great way to earn you rewards! While assets are staked, you can't trade or transfer them.
              </Text>
              
              <Text style={styles.warningText}>
                Unstaking your eligible assets may take between 2 and 30 days.{" "}
                <Text style={styles.learnMoreText}>Learn more</Text>
              </Text>
            </View>
            
            <View style={styles.introFooter}>
              <View style={styles.warningButtonsContainer}>
                <Button
                  title="No, I don't want to stake"
                  onPress={() => router.back()}
                  variant="secondary"
                  size="large"
                  style={styles.warningButton}
                />
                <Button
                  title="I understand, start earning"
                  onPress={handleNextIntroStep}
                  variant="primary"
                  size="large"
                  style={styles.warningButton}
                />
              </View>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  if (showIntro) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Staking</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {renderStakingIntro()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Staking Options</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <TrendingUp size={20} color={theme.colors.primary} />
            <Text style={styles.infoCardTitle}>About Staking</Text>
          </View>
          <Text style={styles.infoCardText}>
            Staking allows you to earn rewards by locking your tokens for a specific period. The longer you stake, the more rewards you can earn.
          </Text>
        </Card>

        <View style={styles.warningCard}>
          <AlertTriangle size={20} color={theme.colors.warning} />
          <Text style={styles.warningText}>
            Early unstaking may result in reduced rewards. Make sure you understand the lock period before staking.
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "all" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("all")}
          >
            <Text style={activeFilter === "all" ? styles.activeFilterText : styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "myTokens" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("myTokens")}
          >
            <Text style={activeFilter === "myTokens" ? styles.activeFilterText : styles.filterText}>My Tokens</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "highestAPY" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("highestAPY")}
          >
            <Text style={activeFilter === "highestAPY" ? styles.activeFilterText : styles.filterText}>Highest APY</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "shortestLock" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("shortestLock")}
          >
            <Text style={activeFilter === "shortestLock" ? styles.activeFilterText : styles.filterText}>Shortest Lock</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          {filteredOptions().map((option) => {
            const token = tokens.find(t => t.id === option.tokenId);
            const hasEnoughBalance = token && token.balance >= option.minAmount;
            
            return (
              <TouchableOpacity 
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleStakeOption(option)}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.tokenInfo}>
                    <TokenIcon 
                      symbol={option.symbol}
                      iconUrl={option.iconUrl}
                      size={36}
                      color={token?.color || theme.colors.primary}
                    />
                    <View>
                      <Text style={styles.tokenName}>{option.name}</Text>
                      <Text style={styles.tokenSymbol}>{option.symbol}</Text>
                    </View>
                  </View>
                  <View style={styles.apyContainer}>
                    <TrendingUp size={16} color={theme.colors.primary} />
                    <Text style={styles.apy}>{option.apy.toFixed(1)}% APY</Text>
                  </View>
                </View>
                
                <View style={styles.optionDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{option.lockPeriod} days lock</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailText}>Min: {option.minAmount} {option.symbol}</Text>
                  </View>
                  {renderRiskBadge(option.risk)}
                </View>
                
                <View style={styles.optionFooter}>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Your Balance</Text>
                    <Text style={styles.balanceValue}>
                      {token ? token.balance.toFixed(token.symbol === "BTC" ? 8 : 2) : "0"} {option.symbol}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.stakeButton,
                      !hasEnoughBalance && styles.disabledButton,
                    ]}
                    onPress={() => handleStakeOption(option)}
                  >
                    <Text style={styles.stakeButtonText}>
                      {hasEnoughBalance ? "Stake" : "Get Tokens"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Staking Info Modal */}
      {showStakingInfo && selectedOption && (
        <Modal
          visible={showStakingInfo}
          transparent={true}
          animationType="none"
          onRequestClose={closeStakingInfo}
        >
          <Animated.View 
            style={[
              styles.modalBackdrop,
              {
                opacity: backdropAnimation
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [
                    {
                      translateY: modalAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0]
                      })
                    }
                  ],
                  opacity: modalAnimation,
                  maxHeight: windowHeight * 0.7 // Limit height to 70% of screen
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Do you understand that staked assets are not available to trade immediately?
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeStakingInfo}
                >
                  <X size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>
                    Staking is a great way to earn you rewards! While assets are staked, you can't trade or transfer them.
                  </Text>
                  
                  <Text style={styles.modalText}>
                    Unstaking your eligible assets may take between 2 and 30 days.{' '}
                    <Text style={styles.learnMoreText}>Learn more</Text>
                  </Text>
                  
                  <View style={styles.stakingDetailsCard}>
                    <View style={styles.stakingDetailsHeader}>
                      <View style={styles.stakingIconContainer}>
                        <TrendingUp size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.stakingHeaderInfo}>
                        <Text style={styles.stakingHeaderTitle}>
                          Stake to earn up to
                        </Text>
                        <Text style={styles.stakingHeaderApy}>
                          {selectedOption.apy.toFixed(2)}% APY
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.stakingDetailRow}>
                      <Text style={styles.stakingDetailLabel}>Earning rate</Text>
                      <Text style={styles.stakingDetailValue}>{selectedOption.apy.toFixed(2)}% APY</Text>
                    </View>
                    
                    <View style={styles.stakingDetailRow}>
                      <View style={styles.stakingDetailLabelWithInfo}>
                        <Text style={styles.stakingDetailLabel}>Earning wait time</Text>
                        <Info size={14} color={theme.colors.textSecondary} />
                      </View>
                      <Text style={styles.stakingDetailValue}>{selectedOption.earningWaitTime}</Text>
                    </View>
                    
                    <View style={styles.stakingDetailRow}>
                      <Text style={styles.stakingDetailLabel}>Payout frequency</Text>
                      <Text style={styles.stakingDetailValue}>{selectedOption.payoutFrequency}</Text>
                    </View>
                    
                    <View style={styles.stakingDetailRow}>
                      <View style={styles.stakingDetailLabelWithInfo}>
                        <Text style={styles.stakingDetailLabel}>Unstaking wait time</Text>
                        <Info size={14} color={theme.colors.textSecondary} />
                      </View>
                      <Text style={styles.stakingDetailValue}>{selectedOption.unstakingWaitTime}</Text>
                    </View>
                    
                    <View style={styles.stakingRisksRow}>
                      <Text style={styles.stakingRisksText}>
                        Staking involves risks.{' '}
                        <Text style={styles.learnMoreText}>Learn more</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalActions}>
                <Button
                  title="No, I don't want to stake"
                  onPress={closeStakingInfo}
                  variant="secondary"
                  size="large"
                  style={styles.actionButton}
                />
                <Button
                  title="I understand, start earning"
                  onPress={handleStartStaking}
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
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
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoCardTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  infoCardText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 179, 71, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: "center",
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.lg,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  activeFilterText: {
    ...theme.typography.bodySmall,
    color: "#fff",
    fontWeight: "600",
  },
  optionsContainer: {
    marginTop: theme.spacing.md,
  },
  optionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenName: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  tokenSymbol: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  apyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  apy: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  optionDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  detailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  riskBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  riskText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  optionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  balanceValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  stakeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  stakeButtonText: {
    ...theme.typography.bodySmall,
    color: "#121212",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "rgba(74, 227, 168, 0.3)",
  },
  
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: theme.spacing.lg,
  },
  modalScrollView: {
    maxHeight: '60%', // Ensure content is scrollable
  },
  modalHeader: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'flex-start',
  },
  modalTitle: {
    ...theme.typography.h4,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: theme.spacing.xl,
  },
  modalText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  learnMoreText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  stakingDetailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  stakingDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stakingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 227, 168, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stakingHeaderInfo: {
    flex: 1,
  },
  stakingHeaderTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  stakingHeaderApy: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  stakingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  stakingDetailLabelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stakingDetailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  stakingDetailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  stakingRisksRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  stakingRisksText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'column',
    padding: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  
  // Intro styles
  introContainer: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  introIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 227, 168, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  introTitle: {
    ...theme.typography.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  introContent: {
    marginBottom: theme.spacing.xl,
  },
  introItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  introText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    flex: 1,
    lineHeight: 22,
  },
  introCardContainer: {
    marginBottom: theme.spacing.xl,
  },
  introCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
  },
  introCardTitle: {
    ...theme.typography.h4,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  introCardText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreButtonText: {
    ...theme.typography.body,
    color: '#4285F4',
    fontWeight: '600',
    marginRight: 4,
  },
  introFooter: {
    marginTop: 'auto',
  },
  continueButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  disclaimerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Benefits styles
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 227, 168, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  
  // Warning styles
  warningContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  warningTitle: {
    ...theme.typography.h4,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  warningButtonsContainer: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  warningButton: {
    width: '100%',
  },
});