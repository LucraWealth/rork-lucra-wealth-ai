import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  Animated,
  Dimensions,
  TextInput as RNTextInput,
  Modal,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Minus, 
  ChevronRight,
  Info,
  ArrowDown,
  Search,
  X,
  RefreshCw
} from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";
import TokenIcon from "@/components/TokenIcon";

interface LiquidityPool {
  id: string;
  pair: string;
  apy: number;
  totalValue: number;
  yourShare: number;
  risk: "Low" | "Medium" | "High";
  token1: {
    symbol: string;
    iconUrl: string;
  };
  token2: {
    symbol: string;
    iconUrl: string;
  };
}

const { width } = Dimensions.get("window");

export default function LiquidityPoolDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tokens } = useWalletStore();
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showToken1Modal, setShowToken1Modal] = useState(false);
  const [showToken2Modal, setShowToken2Modal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const swapButtonAnim = useRef(new Animated.Value(0)).current;

  // Get token data from the wallet store
  const getTokenData = (symbol: string) => {
    const token = tokens.find(t => t.symbol === symbol);
    return {
      symbol: token?.symbol || symbol,
      iconUrl: token?.iconUrl || "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025"
    };
  };

  // Mock liquidity pools data with correct token symbols
  const liquidityPools: LiquidityPool[] = [
    // {
    //   id: "lcra-usdc",
    //   pair: "LCRA-USDC",
    //   apy: 20.5,
    //   totalValue: 1000,
    //   yourShare: 0.1,
    //   risk: "Medium",
    //   token1: getTokenData("LCRA"),
    //   token2: getTokenData("USDC"),
    // },
    {
      id: "eth-usdc",
      pair: "ETH-USDC",
      apy: 15.2,
      totalValue: 1450,
      yourShare: 0.05,
      risk: "Low",
      token1: getTokenData("ETH"),
      token2: getTokenData("USDC"),
    },
    {
      id: "btc-usdc",
      pair: "BTC-USDC",
      apy: 12.8,
      totalValue: 2800,
      yourShare: 0.02,
      risk: "Low",
      token1: getTokenData("BTC"),
      token2: getTokenData("USDC"),
    },
    {
      id: "eth-btc",
      pair: "ETH-BTC",
      apy: 18.5,
      totalValue: 0,
      yourShare: 0,
      risk: "Medium",
      token1: getTokenData("ETH"),
      token2: getTokenData("BTC"),
    },
    {
      id: "sol-usdc",
      pair: "SOL-USDC",
      apy: 22.3,
      totalValue: 0,
      yourShare: 0,
      risk: "Medium",
      token1: getTokenData("SOL"),
      token2: getTokenData("USDC"),
    },
    // {
    //   id: "lcra-eth",
    //   pair: "LCRA-ETH",
    //   apy: 28.7,
    //   totalValue: 0,
    //   yourShare: 0,
    //   risk: "High",
    //   token1: getTokenData("LCRA"),
    //   token2: getTokenData("ETH"),
    // },
  ];
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start swap button glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(swapButtonAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(swapButtonAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Find the pool by ID
  const pool = liquidityPools.find((p) => p.id === id);
  
  if (!pool) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Pool Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Pool not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Find token balances
  const token1Balance = tokens.find(t => t.symbol === pool.token1.symbol)?.balance || 0;
  const token2Balance = tokens.find(t => t.symbol === pool.token2.symbol)?.balance || 0;

  const validateInputs = () => {
    if (!amount1 || !amount2) {
      Alert.alert("Error", "Please enter amounts for both tokens");
      return false;
    }

    const amt1 = parseFloat(amount1);
    const amt2 = parseFloat(amount2);

    if (isNaN(amt1) || isNaN(amt2) || amt1 <= 0 || amt2 <= 0) {
      Alert.alert("Error", "Please enter valid amounts");
      return false;
    }

    if (amt1 > token1Balance) {
      Alert.alert("Error", `Insufficient ${pool.token1.symbol} balance`);
      return false;
    }

    if (amt2 > token2Balance) {
      Alert.alert("Error", `Insufficient ${pool.token2.symbol} balance`);
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (!validateInputs()) return;
    setCurrentStep(2);
  };

  const handleAddLiquidity = () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: "/liquidity-add-success",
        params: {
          id: pool.id,
          token1Amount: amount1,
          token1Symbol: pool.token1.symbol,
          token2Amount: amount2,
          token2Symbol: pool.token2.symbol
        }
      });
    }, 1500);
  };

  const handleRemoveLiquidity = () => {
    if (pool.yourShare <= 0) {
      Alert.alert("Error", "You don't have any liquidity to remove");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/liquidity-remove-success");
    }, 1500);
  };

  const calculateAmount2 = (value: string) => {
    if (!value || isNaN(parseFloat(value))) {
      setAmount2("");
      return;
    }

    // Simple 1:1 ratio for demo purposes
    // In a real app, this would use the pool's exchange rate
    const amt1 = parseFloat(value);
    const amt2 = amt1 * 1.2; // Example ratio
    setAmount2(amt2.toFixed(6));
  };

  const calculateAmount1 = (value: string) => {
    if (!value || isNaN(parseFloat(value))) {
      setAmount1("");
      return;
    }

    // Simple 1:1 ratio for demo purposes
    const amt2 = parseFloat(value);
    const amt1 = amt2 / 1.2; // Example ratio
    setAmount1(amt1.toFixed(6));
  };

  const setMaxAmount1 = () => {
    setAmount1(token1Balance.toString());
    calculateAmount2(token1Balance.toString());
  };

  const setMaxAmount2 = () => {
    setAmount2(token2Balance.toString());
    calculateAmount1(token2Balance.toString());
  };
  
  const handleSwapTokens = () => {
    // Swap tokens
    const temp = amount1;
    setAmount1(amount2);
    setAmount2(temp);
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
  
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderTokenModal = (
    visible: boolean, 
    onClose: () => void, 
    onSelect: (symbol: string) => void, 
    selectedSymbol: string
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Token</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <RNTextInput
              style={styles.searchInput}
              placeholder="Search tokens"
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <FlatList
            data={filteredTokens}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tokenItem,
                  selectedSymbol === item.symbol && styles.selectedTokenItem,
                ]}
                onPress={() => onSelect(item.symbol)}
              >
                <TokenIcon symbol={item.symbol} iconUrl={item.iconUrl} size={32} />
                <View style={styles.tokenItemInfo}>
                  <Text style={styles.tokenItemSymbol}>{item.symbol}</Text>
                  <Text style={styles.tokenItemName}>{item.name}</Text>
                </View>
                <Text style={styles.tokenItemBalance}>{item.balance.toFixed(4)}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
  
  const renderAddLiquidityStep1 = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.swapCard}>
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <RNTextInput
                  style={styles.amountInput}
                  value={amount1}
                  onChangeText={(text) => {
                    setAmount1(text);
                    calculateAmount2(text);
                  }}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>
              
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => setShowToken1Modal(true)}
              >
                <TokenIcon 
                  symbol={pool.token1.symbol} 
                  iconUrl={pool.token1.iconUrl} 
                  size={24} 
                />
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{pool.token1.symbol}</Text>
                  <Text style={styles.tokenName}>
                    {tokens.find(t => t.symbol === pool.token1.symbol)?.name || pool.token1.symbol}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>
                Balance: {token1Balance.toFixed(6)} {pool.token1.symbol}
              </Text>
              <TouchableOpacity
                style={styles.maxButton}
                onPress={setMaxAmount1}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Swap Button */}
          <View style={styles.swapButtonContainer}>
            <Animated.View
              style={[
                styles.swapButtonGlow,
                Platform.OS !== 'web' ? {
                  shadowOpacity: swapButtonAnim,
                  shadowRadius: swapButtonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 12],
                  }),
                } : {
                  // For web, use a dummy transform to avoid the error
                  opacity: swapButtonAnim
                },
              ]}
            >
              <TouchableOpacity style={styles.swapButton} onPress={handleSwapTokens}>
                <ArrowDown size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          <View style={styles.swapCard}>
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <RNTextInput
                  style={styles.amountInput}
                  value={amount2}
                  onChangeText={(text) => {
                    setAmount2(text);
                    calculateAmount1(text);
                  }}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>
              
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => setShowToken2Modal(true)}
              >
                <TokenIcon 
                  symbol={pool.token2.symbol} 
                  iconUrl={pool.token2.iconUrl} 
                  size={24} 
                />
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{pool.token2.symbol}</Text>
                  <Text style={styles.tokenName}>
                    {tokens.find(t => t.symbol === pool.token2.symbol)?.name || pool.token2.symbol}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>
                Balance: {token2Balance.toFixed(6)} {pool.token2.symbol}
              </Text>
              <TouchableOpacity
                style={styles.maxButton}
                onPress={setMaxAmount2}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Exchange Rate */}
          <View style={styles.exchangeRateCard}>
            <View style={styles.exchangeRateHeader}>
              <Text style={styles.exchangeRateLabel}>Exchange Rate</Text>
              <TouchableOpacity style={styles.refreshRateButton}>
                <RefreshCw size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.exchangeRateRow}>
              <Text style={styles.exchangeRateText}>
                1 {pool.token1.symbol} = 1.2 {pool.token2.symbol}
              </Text>
            </View>
          </View>
          
          <View style={styles.warningContainer}>
            <AlertTriangle size={16} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              Adding liquidity is subject to impermanent loss. Make sure you understand the risks.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.reviewButton,
              (!amount1 || parseFloat(amount1) <= 0 || parseFloat(amount1) > token1Balance) && styles.reviewButtonDisabled,
            ]}
            onPress={handleNextStep}
            disabled={!amount1 || parseFloat(amount1) <= 0 || parseFloat(amount1) > token1Balance}
          >
            <Text style={styles.reviewButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Token Selection Modals */}
        {renderTokenModal(
          showToken1Modal, 
          () => setShowToken1Modal(false), 
          (symbol) => {
            // In a real app, you would update the pool token here
            setShowToken1Modal(false);
          }, 
          pool.token1.symbol
        )}
        
        {renderTokenModal(
          showToken2Modal, 
          () => setShowToken2Modal(false), 
          (symbol) => {
            // In a real app, you would update the pool token here
            setShowToken2Modal(false);
          }, 
          pool.token2.symbol
        )}
      </KeyboardAvoidingView>
    );
  };
  
  const renderAddLiquidityStep2 = () => {
    const amt1 = parseFloat(amount1);
    const amt2 = parseFloat(amount2);
    const totalValueUSD = (amt1 * (tokens.find(t => t.symbol === pool.token1.symbol)?.price || 0)) + 
                          (amt2 * (tokens.find(t => t.symbol === pool.token2.symbol)?.price || 0));
    
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Confirm Add Liquidity</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>You will provide</Text>
            </View>
            
            <View style={styles.tokenSummary}>
              <View style={styles.tokenInfo}>
                <TokenIcon 
                  symbol={pool.token1.symbol} 
                  iconUrl={pool.token1.iconUrl} 
                  size={24} 
                />
                <Text style={styles.tokenInputSymbol}>{pool.token1.symbol}</Text>
              </View>
              <Text style={styles.summaryTitle}>{parseFloat(amount1).toFixed(6)}</Text>
            </View>
            
            <View style={styles.tokenSummary}>
              <View style={styles.tokenInfo}>
                <TokenIcon 
                  symbol={pool.token2.symbol} 
                  iconUrl={pool.token2.iconUrl} 
                  size={24} 
                />
                <Text style={styles.tokenInputSymbol}>{pool.token2.symbol}</Text>
              </View>
              <Text style={styles.summaryTitle}>{parseFloat(amount2).toFixed(6)}</Text>
            </View>
          </View>
          
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Value</Text>
              <Text style={styles.detailValue}>${totalValueUSD.toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exchange Rate</Text>
              <Text style={styles.detailValue}>
                1 {pool.token1.symbol} = {(parseFloat(amount2) / parseFloat(amount1)).toFixed(4)} {pool.token2.symbol}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabelWithInfo}>
                <Text style={styles.detailLabel}>Pool Share</Text>
                <TouchableOpacity style={styles.infoIcon}>
                  <Info size={14} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.detailValue}>
                {((totalValueUSD / (pool.totalValue + totalValueUSD)) * 100).toFixed(2)}%
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>APY</Text>
              <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                {pool.apy.toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.warningContainer}>
            <AlertTriangle size={16} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              Adding liquidity is subject to impermanent loss. Make sure you understand the risks.
            </Text>
          </View>
          
          <View style={styles.buttonRow}>
            <Button
              title="Back"
              onPress={() => setCurrentStep(1)}
              variant="secondary"
              size="large"
              style={styles.backBtn}
            />
            <Button
              title="Add Liquidity"
              onPress={handleAddLiquidity}
              variant="primary"
              size="large"
              loading={isLoading}
              style={styles.confirmBtn}
            />
          </View>
        </Card>
      </ScrollView>
    );
  };
  
  const renderRemoveLiquidity = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.removeLiquidityCard}>
          <Text style={styles.removeLiquidityTitle}>Remove Liquidity</Text>
          
          {pool.yourShare > 0 ? (
            <>
              <View style={styles.yourLiquidityInfo}>
                <Text style={styles.yourLiquidityLabel}>Your Liquidity</Text>
                <Text style={styles.yourLiquidityValue}>
                  ${(pool.totalValue * pool.yourShare / 100).toFixed(2)}
                </Text>
                <Text style={styles.yourLiquiditySubvalue}>
                  {pool.yourShare.toFixed(2)}% of pool
                </Text>
              </View>
              
              <View style={styles.tokenAmounts}>
                <View style={styles.tokenAmount}>
                  <View style={styles.tokenInfo}>
                    <TokenIcon 
                      symbol={pool.token1.symbol} 
                      iconUrl={pool.token1.iconUrl} 
                      size={24} 
                    />
                    <Text style={styles.tokenInputSymbol}>{pool.token1.symbol}</Text>
                  </View>
                  <Text style={styles.tokenAmountValue}>
                    {((pool.totalValue * pool.yourShare / 100) / 2 / 100).toFixed(6)}
                  </Text>
                </View>
                
                <View style={styles.tokenSummary}>
                  <View style={styles.tokenInfo}>
                    <TokenIcon 
                      symbol={pool.token2.symbol} 
                      iconUrl={pool.token2.iconUrl} 
                      size={24} 
                    />
                    <Text style={styles.tokenInputSymbol}>{pool.token2.symbol}</Text>
                  </View>
                  <Text style={styles.tokenAmountValue}>
                    {((pool.totalValue * pool.yourShare / 100) / 2 / 100).toFixed(6)}
                  </Text>
                </View>
              </View>
              
              <Button
                title="Remove Liquidity"
                onPress={handleRemoveLiquidity}
                variant="primary"
                size="large"
                loading={isLoading}
              />
            </>
          ) : (
            <View style={styles.noLiquidityContainer}>
              <Text style={styles.noLiquidityText}>
                You don't have any liquidity in this pool yet.
              </Text>
              <Button
                title="Add Liquidity"
                onPress={() => setActiveTab("add")}
                variant="secondary"
                size="medium"
                style={styles.addLiquidityButton}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{pool.pair}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View 
          style={[
            styles.poolHeaderContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.poolHeader}>
            <View style={styles.poolIcons}>
              <View style={styles.poolIconContainer}>
                <TokenIcon 
                  symbol={pool.token1.symbol} 
                  iconUrl={pool.token1.iconUrl} 
                  size={28} 
                />
              </View>
              <View style={[styles.poolIconContainer, styles.poolIconOverlap]}>
                <TokenIcon 
                  symbol={pool.token2.symbol} 
                  iconUrl={pool.token2.iconUrl} 
                  size={28} 
                />
              </View>
            </View>
            <View style={styles.apyContainer}>
              <TrendingUp size={16} color={theme.colors.primary} />
              <Text style={styles.apy}>{pool.apy.toFixed(1)}% APY</Text>
            </View>
            {renderRiskBadge(pool.risk)}
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Your Pool Value</Text>
                <Text style={styles.statValue}>
                  ${(pool.totalValue * pool.yourShare / 100).toFixed(2)}
                </Text>
                <Text style={styles.statSubvalue}>
                  {pool.yourShare.toFixed(2)}% Share
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Yearly Reward</Text>
                <Text style={styles.statValue}>
                  ${(pool.totalValue * pool.yourShare / 100 * pool.apy / 100).toFixed(2)}
                </Text>
                <Text style={styles.statSubvalue}>
                  ${((pool.totalValue * pool.yourShare / 100 * pool.apy / 100) / 365).toFixed(2)}/day
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View 
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "add" && styles.activeTab]}
              onPress={() => {
                setActiveTab("add");
                setCurrentStep(1);
              }}
            >
              <Plus size={16} color={activeTab === "add" ? theme.colors.primary : theme.colors.textSecondary} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "add" && styles.activeTabText,
                ]}
              >
                Add Liquidity
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "remove" && styles.activeTab]}
              onPress={() => setActiveTab("remove")}
            >
              <Minus size={16} color={activeTab === "remove" ? theme.colors.primary : theme.colors.textSecondary} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "remove" && styles.activeTabText,
                ]}
              >
                Remove Liquidity
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {activeTab === "add" ? (
            currentStep === 1 ? renderAddLiquidityStep1() : renderAddLiquidityStep2()
          ) : (
            renderRemoveLiquidity()
          )}
        </Animated.View>
      </ScrollView>
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  title: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  poolHeaderContainer: {
    marginBottom: theme.spacing.lg,
  },
  poolHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  poolIcons: {
    flexDirection: "row",
    marginRight: theme.spacing.md,
  },
  poolIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  poolIconOverlap: {
    marginLeft: -15,
  },
  poolIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  apyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  apy: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  riskBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  riskText: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: theme.spacing.md,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h4,
    fontWeight: "700",
    color: theme.colors.text,
  },
  statSubvalue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
  },
  activeTab: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  tabText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  // New Swap-inspired styles
  swapCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  inputSection: {
    flexDirection: "column",
    gap: theme.spacing.md,
  },
  inputWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  amountInput: {
    ...theme.typography.h2,
    color: theme.colors.text,
    padding: 0,
  },
  tokenSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  tokenInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  tokenSymbol: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: "600",
  },
  tokenName: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  balanceText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  maxButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  maxButtonText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontWeight: "600",
  },
  swapButtonContainer: {
    alignItems: "center",
    marginVertical: -theme.spacing.md,
    zIndex: 10,
  },
  swapButtonGlow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  exchangeRateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  exchangeRateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  exchangeRateLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  refreshRateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  exchangeRateRow: {
    marginBottom: theme.spacing.md,
  },
  exchangeRateText: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: "600",
  },
  warningContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 179, 71, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 179, 71, 0.2)",
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  reviewButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xxl,
  },
  reviewButtonDisabled: {
    backgroundColor: "rgba(74, 227, 168, 0.3)",
  },
  reviewButtonText: {
    ...theme.typography.h4,
    color: theme.colors.background,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: theme.spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : theme.spacing.xl,
    height: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: "600",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    ...theme.typography.bodyMedium,
    padding: 0,
  },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  selectedTokenItem: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
  },
  tokenItemInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  tokenItemSymbol: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: "600",
  },
  tokenItemName: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  tokenItemBalance: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  // Confirmation step styles
  confirmCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  confirmTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryHeader: {
    marginBottom: theme.spacing.sm,
  },
  summaryTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    color: theme.colors.text,
  },
  tokenSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  tokenInputSymbol: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  tokenAmount: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  detailsSection: {
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  detailLabelWithInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoIcon: {
    marginLeft: 4,
  },
  detailValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backBtn: {
    flex: 1,
    marginRight: 5,
  },
  confirmBtn: {
    flex: 2,
    marginLeft: 5,
  },
  // Remove liquidity styles
  removeLiquidityCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  removeLiquidityTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  yourLiquidityInfo: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.md,
  },
  yourLiquidityLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  yourLiquidityValue: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
  },
  yourLiquiditySubvalue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tokenAmounts: {
    marginBottom: theme.spacing.lg,
  },
  tokenAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tokenAmountValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  noLiquidityContainer: {
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  noLiquidityText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  addLiquidityButton: {
    marginTop: theme.spacing.md,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});