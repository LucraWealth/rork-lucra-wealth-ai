import React, { useState, useEffect, useRef } from "react";
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
  Dimensions,
  TextInput
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import { 
  ArrowLeft, 
  Droplet, 
  TrendingUp, 
  Search, 
  AlertTriangle,
  Info,
  X,
  ChevronRight,
  Plus
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

export default function LiquidityPoolsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const { tokens } = useWalletStore();
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [showPoolInfo, setShowPoolInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Modal animation values
  const [modalAnimation] = useState(new Animated.Value(0));
  const [backdropAnimation] = useState(new Animated.Value(0));
  
  const windowHeight = Dimensions.get('window').height;

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
  }, []);

  // Filter pools based on active filter
  const filteredPools = () => {
    let pools = liquidityPools;
    
    // Apply search filter
    if (searchQuery) {
      pools = pools.filter(pool => 
        pool.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.token1.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.token2.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    switch (activeFilter) {
      case "myPools":
        return pools.filter(pool => pool.yourShare > 0);
      case "highestAPY":
        return [...pools].sort((a, b) => b.apy - a.apy);
      default:
        return pools;
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
  
  const handlePoolPress = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setShowPoolInfo(true);
    
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
  
  const closePoolInfo = () => {
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
      setShowPoolInfo(false);
      setSelectedPool(null);
    });
  };
  
  const handleAddLiquidity = () => {
    if (!selectedPool) return;
    
    closePoolInfo();
    router.push(`/liquidity-pool/${selectedPool.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Liquidity Pools</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Droplet size={20} color={theme.colors.primary} />
              <Text style={styles.infoCardTitle}>About Liquidity Pools</Text>
            </View>
            <Text style={styles.infoCardText}>
              Liquidity pools allow you to earn fees by providing assets to decentralized exchanges. Higher APY usually comes with higher risk.
            </Text>
          </Card>

          <View style={styles.warningCard}>
            <AlertTriangle size={20} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              Providing liquidity involves risks including impermanent loss. Research before investing.
            </Text>
          </View>
        </Animated.View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pools"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "all" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("all")}
          >
            <Text style={activeFilter === "all" ? styles.activeFilterText : styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "myPools" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("myPools")}
          >
            <Text style={activeFilter === "myPools" ? styles.activeFilterText : styles.filterText}>My Pools</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === "highestAPY" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("highestAPY")}
          >
            <Text style={activeFilter === "highestAPY" ? styles.activeFilterText : styles.filterText}>Highest APY</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.poolsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {filteredPools().map((pool) => (
            <TouchableOpacity 
              key={pool.id}
              style={styles.poolCard}
              onPress={() => handlePoolPress(pool)}
            >
              <View style={styles.poolHeader}>
                <View style={styles.poolIcons}>
                  <View style={styles.poolIconContainer}>
                    <TokenIcon 
                      symbol={pool.token1.symbol} 
                      iconUrl={pool.token1.iconUrl} 
                      size={24} 
                    />
                  </View>
                  <View style={[styles.poolIconContainer, styles.poolIconOverlap]}>
                    <TokenIcon 
                      symbol={pool.token2.symbol} 
                      iconUrl={pool.token2.iconUrl} 
                      size={24} 
                    />
                  </View>
                </View>
                <View style={styles.poolInfo}>
                  <Text style={styles.poolPair}>{pool.pair}</Text>
                  <View style={styles.apyContainer}>
                    <TrendingUp size={14} color={theme.colors.primary} />
                    <Text style={styles.apy}>{pool.apy.toFixed(1)}% APY</Text>
                  </View>
                </View>
                {renderRiskBadge(pool.risk)}
              </View>
              
              <View style={styles.poolDetails}>
                <View style={styles.poolDetail}>
                  <Text style={styles.poolDetailLabel}>Total Value</Text>
                  <Text style={styles.poolDetailValue}>
                    ${pool.totalValue.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.poolDetail}>
                  <Text style={styles.poolDetailLabel}>Your Share</Text>
                  <Text style={styles.poolDetailValue}>
                    {pool.yourShare > 0 ? `${pool.yourShare.toFixed(2)}%` : "None"}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.poolButton}
                onPress={() => handlePoolPress(pool)}
              >
                <Text style={styles.poolButtonText}>
                  {pool.yourShare > 0 ? "Manage" : "Add Liquidity"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.createPoolButton}
          onPress={() => router.push("/create-liquidity-pool")}
        >
          <View style={styles.createPoolIcon}>
            <Plus size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.createPoolText}>Create New Pool</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Pool Info Modal */}
      {showPoolInfo && selectedPool && (
        <Modal
          visible={showPoolInfo}
          transparent={true}
          animationType="none"
          onRequestClose={closePoolInfo}
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
                  {selectedPool.pair} Pool
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closePoolInfo}
                >
                  <X size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <View style={styles.poolIconsLarge}>
                    <View style={styles.poolIconContainerLarge}>
                      <TokenIcon 
                        symbol={selectedPool.token1.symbol} 
                        iconUrl={selectedPool.token1.iconUrl} 
                        size={36} 
                      />
                    </View>
                    <View style={[styles.poolIconContainerLarge, styles.poolIconOverlapLarge]}>
                      <TokenIcon 
                        symbol={selectedPool.token2.symbol} 
                        iconUrl={selectedPool.token2.iconUrl} 
                        size={36} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.modalPoolInfo}>
                    <Text style={styles.modalPoolPair}>{selectedPool.pair}</Text>
                    <View style={styles.apyContainerLarge}>
                      <TrendingUp size={16} color={theme.colors.primary} />
                      <Text style={styles.apyLarge}>{selectedPool.apy.toFixed(1)}% APY</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalDetailsCard}>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Total Value Locked</Text>
                      <Text style={styles.modalDetailValue}>${selectedPool.totalValue.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Your Share</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedPool.yourShare > 0 ? `${selectedPool.yourShare.toFixed(2)}%` : "None"}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <View style={styles.modalDetailLabelWithInfo}>
                        <Text style={styles.modalDetailLabel}>Risk Level</Text>
                        <Info size={14} color={theme.colors.textSecondary} />
                      </View>
                      <Text style={[
                        styles.modalDetailValue,
                        { 
                          color: selectedPool.risk === "Low" 
                            ? theme.colors.success 
                            : selectedPool.risk === "Medium" 
                              ? theme.colors.warning 
                              : theme.colors.error 
                        }
                      ]}>
                        {selectedPool.risk}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Fee Tier</Text>
                      <Text style={styles.modalDetailValue}>0.3%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalWarning}>
                    <AlertTriangle size={20} color={theme.colors.warning} />
                    <Text style={styles.modalWarningText}>
                      Providing liquidity involves risks including impermanent loss. Make sure you understand how liquidity pools work before investing.
                    </Text>
                  </View>
                  
                  {selectedPool.yourShare > 0 && (
                    <View style={styles.yourPositionCard}>
                      <Text style={styles.yourPositionTitle}>Your Position</Text>
                      
                      <View style={styles.positionDetailRow}>
                        <Text style={styles.positionDetailLabel}>{selectedPool.token1.symbol}</Text>
                        <Text style={styles.positionDetailValue}>
                          {(selectedPool.totalValue * selectedPool.yourShare / 100 / 2).toFixed(6)}
                        </Text>
                      </View>
                      
                      <View style={styles.positionDetailRow}>
                        <Text style={styles.positionDetailLabel}>{selectedPool.token2.symbol}</Text>
                        <Text style={styles.positionDetailValue}>
                          {(selectedPool.totalValue * selectedPool.yourShare / 100 / 2).toFixed(6)}
                        </Text>
                      </View>
                      
                      <View style={styles.positionDetailRow}>
                        <Text style={styles.positionDetailLabel}>Value</Text>
                        <Text style={styles.positionDetailValue}>
                          ${(selectedPool.totalValue * selectedPool.yourShare / 100).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
              
              <View style={styles.modalActions}>
                {selectedPool.yourShare > 0 ? (
                  <>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => {
                        closePoolInfo();
                        router.push(`/liquidity-pool/${selectedPool.id}`);
                      }}
                    >
                      <Text style={styles.removeButtonText}>Remove Liquidity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.addMoreButton}
                      onPress={handleAddLiquidity}
                    >
                      <Text style={styles.addMoreButtonText}>Add More</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddLiquidity}
                  >
                    <Text style={styles.addButtonText}>Add Liquidity</Text>
                  </TouchableOpacity>
                )}
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
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 179, 71, 0.2)",
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  activeFilterButton: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderColor: "rgba(74, 227, 168, 0.3)",
  },
  filterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  activeFilterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  poolsContainer: {
    marginTop: theme.spacing.md,
  },
  poolCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  poolHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  poolIcons: {
    flexDirection: "row",
    marginRight: theme.spacing.md,
    width: 45,
  },
  poolIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  poolIconOverlap: {
    marginLeft: -15,
  },
  poolInfo: {
    flex: 1,
  },
  poolPair: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.text,
  },
  apyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
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
  poolDetails: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  poolDetail: {
    flex: 1,
  },
  poolDetailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  poolDetailValue: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  poolButton: {
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  poolButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  createPoolButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  createPoolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  createPoolText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: theme.spacing.xl,
  },
  poolIconsLarge: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  poolIconContainerLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  poolIconOverlapLarge: {
    marginLeft: -20,
  },
  modalPoolInfo: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalPoolPair: {
    ...theme.typography.h3,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  apyContainerLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  apyLarge: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalDetailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
    backgroundColor: "rgba(255, 179, 71, 0.1)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: "rgba(255, 179, 71, 0.2)",
  },
  modalWarningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  yourPositionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  yourPositionTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  positionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  positionDetailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  positionDetailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  removeButton: {
    flex: 1,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.2)",
  },
  removeButtonText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: "600",
  },
  addMoreButton: {
    flex: 1,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(74, 227, 168, 0.2)",
  },
  addMoreButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  addButtonText: {
    ...theme.typography.body,
    color: "#121212",
    fontWeight: "600",
  },
});