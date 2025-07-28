import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useWalletStore } from "@/store/walletStore";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Info,
  ChevronRight
} from "lucide-react-native";
import Button from "@/components/Button";
import TokenIcon from "@/components/TokenIcon";

export default function StakeMoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    id, 
    tokenId, 
    name, 
    symbol, 
    apy, 
    lockPeriod, 
    minAmount,
    earningWaitTime,
    payoutFrequency,
    unstakingWaitTime,
    isNewStake
  } = params;
  
  const { tokens, stakingPositions, stakeMore, addStakingPosition } = useWalletStore();
  const [amount, setAmount] = useState("");
  const [stakePosition, setStakePosition] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const windowHeight = Dimensions.get('window').height;
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;
  
  // Modal animation values
  const [modalAnimation] = useState(new Animated.Value(0));
  const [backdropAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Find the staking position and token
    if (id) {
      if (isNewStake === "true") {
        // This is a new stake, get token info
        const matchingToken = tokens.find(t => t.id === tokenId);
        if (matchingToken) {
          setToken(matchingToken);
        }
      } else {
        // This is adding to an existing position
        const position = stakingPositions.find(p => p.id === id);
        if (position) {
          setStakePosition(position);
          
          // Find the matching token
          const matchingToken = tokens.find(t => t.symbol === position.symbol);
          if (matchingToken) {
            setToken(matchingToken);
          }
        }
      }
    }
    
    // Animate the screen entry
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [id]);
  
  const handleMaxPress = () => {
    if (token) {
      setAmount(token.balance.toString());
    }
  };
  
  const handleStakeMore = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    
    setShowConfirmation(true);
    
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
  
  const closeConfirmation = () => {
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
      setShowConfirmation(false);
    });
  };
  
  const confirmStake = () => {
    setIsLoading(true);
    closeConfirmation();
    
    // Simulate API call
    setTimeout(() => {
      const amountValue = parseFloat(amount);
      
      if (isNewStake === "true" && token) {
        // Create a new staking position
        const newPositionId = `${symbol?.toLowerCase()}-${Date.now()}`;
        
        // Make sure all required fields are present
        const newPosition = {
          tokenId: tokenId as string,
          name: name as string,
          symbol: symbol as string,
          apy: parseFloat(apy as string),
          lockPeriod: parseInt(lockPeriod as string),
          stakedAmount: amountValue,
          tokenPrice: token.price,
          progress: 0,
          dailyReward: (amountValue * token.price * parseFloat(apy as string) / 100 / 365),
          totalEarned: 0,
          startDate: new Date().toLocaleDateString(),
          endDate: new Date(Date.now() + parseInt(lockPeriod as string) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          iconUrl: token.iconUrl,
          minimumStake: parseFloat(minAmount as string),
        };
        
        // Call the addStakingPosition function
        addStakingPosition(newPosition);
      } else if (stakePosition) {
        // Add to existing position
        stakeMore(stakePosition.id, amountValue);
      }
      
      setIsLoading(false);
      
      router.push({
        pathname: "/stake-success",
        params: { 
          id: stakePosition ? stakePosition.id : id,
          amount: amount,
          symbol: token?.symbol
        }
      });
    }, 1500);
  };
  
  const getUSDValue = () => {
    if (!amount || !token) return 0;
    return parseFloat(amount) * token.price;
  };
  
  const getEstimatedRewards = () => {
    if (!amount || !token) return 0;
    const apyValue = stakePosition ? stakePosition.apy : parseFloat(apy as string);
    const lockPeriodValue = stakePosition ? stakePosition.lockPeriod : parseInt(lockPeriod as string);
    
    return parseFloat(amount) * (apyValue / 100) * (lockPeriodValue / 365);
  };
  
  if (!token && !stakePosition) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNewStake === "true" ? `Stake ${symbol}` : `Stake More ${token?.symbol}`}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.tokenInfoContainer}>
            <TokenIcon 
              symbol={token?.symbol || (symbol as string)} 
              size={48} 
              iconUrl={token?.iconUrl}
              color={token?.color}
            />
            <Text style={styles.tokenName}>{token?.name || (name as string)}</Text>
            <View style={styles.apyBadge}>
              <Text style={styles.apyText}>
                {stakePosition ? stakePosition.apy : apy}% APY
              </Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>
                  {stakePosition ? "Currently Staked" : "Minimum Stake"}
                </Text>
                <Text style={styles.infoValue}>
                  {stakePosition ? stakePosition.stakedAmount.toFixed(6) : parseFloat(minAmount as string).toFixed(6)}
                </Text>
                <Text style={styles.infoSymbol}>{token?.symbol || (symbol as string)}</Text>
                <Text style={styles.infoUsdValue}>
                  ${stakePosition 
                    ? (stakePosition.stakedAmount * token?.price).toFixed(2) 
                    : (parseFloat(minAmount as string) * token?.price).toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Available Balance</Text>
                <Text style={styles.infoValue}>{token?.balance.toFixed(6)}</Text>
                <Text style={styles.infoSymbol}>{token?.symbol}</Text>
                <Text style={styles.infoUsdValue}>
                  ${(token?.balance * token?.price).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.stakeAmountContainer}>
            <View style={styles.stakeAmountHeader}>
              <Text style={styles.stakeAmountLabel}>Stake Amount</Text>
              <TouchableOpacity
                style={styles.maxButton}
                onPress={handleMaxPress}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={styles.inputSymbol}>{token?.symbol}</Text>
            </View>
            
            <Text style={styles.usdValue}>
              ≈ ${getUSDValue().toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>Estimated Rewards</Text>
            <View style={styles.rewardsCard}>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Daily</Text>
                <Text style={styles.rewardValue}>
                  {(getEstimatedRewards() / parseInt(lockPeriod as string)).toFixed(6)} {token?.symbol}
                </Text>
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Monthly</Text>
                <Text style={styles.rewardValue}>
                  {(getEstimatedRewards() / parseInt(lockPeriod as string) * 30).toFixed(6)} {token?.symbol}
                </Text>
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Total ({lockPeriod} days)</Text>
                <Text style={styles.rewardValue}>
                  {getEstimatedRewards().toFixed(6)} {token?.symbol}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Clock size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoItemText}>
                Lock period: {stakePosition?.lockPeriod || lockPeriod} days
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoItemText}>
                Rewards paid {payoutFrequency || "daily"}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <AlertCircle size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoItemText}>
                Minimum stake: {stakePosition?.minimumStake || minAmount} {token?.symbol}
              </Text>
            </View>
          </View>
          
          <Button
            title="Stake Now"
            onPress={handleStakeMore}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > token?.balance}
            loading={isLoading}
            style={styles.stakeButton}
          />
        </Animated.View>
      </ScrollView>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <Modal
          visible={showConfirmation}
          transparent={true}
          animationType="none"
          onRequestClose={closeConfirmation}
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
                  Confirm Staking
                </Text>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <View style={styles.modalTokenInfo}>
                    <TokenIcon 
                      symbol={token?.symbol || (symbol as string)} 
                      size={60} 
                      iconUrl={token?.iconUrl}
                      color={token?.color}
                    />
                    <Text style={styles.modalTokenName}>
                      Stake {amount} {token?.symbol}
                    </Text>
                    <Text style={styles.modalTokenValue}>
                      ${getUSDValue().toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.modalDetailsCard}>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Earning rate</Text>
                      <Text style={styles.modalDetailValue}>
                        {stakePosition ? stakePosition.apy : apy}% APY
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <View style={styles.modalDetailLabelWithInfo}>
                        <Text style={styles.modalDetailLabel}>Earning wait time</Text>
                        <Info size={14} color={theme.colors.textSecondary} />
                      </View>
                      <Text style={styles.modalDetailValue}>
                        {earningWaitTime || "1 day"}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Payout frequency</Text>
                      <Text style={styles.modalDetailValue}>
                        {payoutFrequency || "Every 3 days"}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <View style={styles.modalDetailLabelWithInfo}>
                        <Text style={styles.modalDetailLabel}>Unstaking wait time</Text>
                        <Info size={14} color={theme.colors.textSecondary} />
                      </View>
                      <Text style={styles.modalDetailValue}>
                        {unstakingWaitTime || "About 13 days"}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalWarning}>
                    <AlertCircle size={20} color={theme.colors.warning} />
                    <Text style={styles.modalWarningText}>
                      Your tokens will be locked for {stakePosition?.lockPeriod || lockPeriod} days. Early unstaking may result in reduced rewards.
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={closeConfirmation}
                  variant="secondary"
                  size="large"
                  style={styles.modalButton}
                />
                <Button
                  title="Confirm Stake"
                  onPress={confirmStake}
                  variant="primary"
                  size="large"
                  style={styles.modalButton}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  headerTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
  },
  content: {
    padding: theme.spacing.lg,
  },
  tokenInfoContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  tokenName: {
    ...theme.typography.h3,
    fontWeight: "700",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  apyBadge: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  apyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
  },
  infoColumn: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: theme.spacing.md,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...theme.typography.h4,
    fontWeight: "700",
  },
  infoSymbol: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoUsdValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  stakeAmountContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  stakeAmountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  stakeAmountLabel: {
    ...theme.typography.body,
    fontWeight: "600",
  },
  maxButton: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  maxButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  input: {
    flex: 1,
    ...theme.typography.h3,
    color: theme.colors.text,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  inputSymbol: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  usdValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  rewardsContainer: {
    marginBottom: theme.spacing.xl,
  },
  rewardsTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  rewardsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  rewardLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  rewardValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  infoSection: {
    marginBottom: theme.spacing.xl,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  infoItemText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  stakeButton: {
    marginBottom: theme.spacing.xxl,
    width: "100%", // Ensure button is full width
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
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
    maxHeight: '60%',
  },
  modalHeader: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalContent: {
    padding: theme.spacing.xl,
  },
  modalTokenInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTokenName: {
    ...theme.typography.h3,
    fontWeight: '700',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  modalTokenValue: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  modalDetailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  modalDetailLabelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDetailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  modalDetailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  modalWarning: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
  },
  modalWarningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'column',
    padding: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    gap: theme.spacing.md,
  },
  modalButton: {
    width: '100%',
  },
});