import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useWalletStore } from "@/store/walletStore";
import {
  ArrowLeft,
  ArrowDown,
  RefreshCw,
  Copy,
  ChevronRight,
  Settings,
  Search,
} from "lucide-react-native";
import TokenIcon from "@/components/TokenIcon";
import { Token } from "@/mocks/tokens";

export default function TokenSwapScreen() {
  const router = useRouter();
  const { tokens, swapTokens } = useWalletStore();
  
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState(tokens.find(t => t.symbol === "ETH") || tokens[0]);
  const [toToken, setToToken] = useState(tokens.find(t => t.symbol === "BTC") || tokens[1]);
  const [exchangeRate, setExchangeRate] = useState(1.2);
  const [isLoading, setIsLoading] = useState(false);
  const [showFromTokenModal, setShowFromTokenModal] = useState(false);
  const [showToTokenModal, setShowToTokenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Animation for the swap button glow
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Calculate exchange rate
  useEffect(() => {
    if (fromToken && toToken) {
      const rate = fromToken.price / toToken.price;
      setExchangeRate(rate);
    }
  }, [fromToken, toToken]);
  
  // Calculate to amount based on from amount
  useEffect(() => {
    if (fromAmount) {
      const amount = parseFloat(fromAmount) * exchangeRate;
      setToAmount(amount.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, exchangeRate]);
  
  const handleFromAmountChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const parts = filtered.split(".");
    if (parts.length > 2) {
      return;
    }
    
    setFromAmount(filtered);
  };
  
  const handleToAmountChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const parts = filtered.split(".");
    if (parts.length > 2) {
      return;
    }
    
    setToAmount(filtered);
    
    // Calculate from amount based on to amount
    if (filtered) {
      const amount = parseFloat(filtered) / exchangeRate;
      setFromAmount(amount.toFixed(6));
    } else {
      setFromAmount("");
    }
  };
  
  const handleSwapTokens = () => {
    // Swap tokens
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    
    // Swap amounts
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };
  
  const handleMaxAmount = () => {
    setFromAmount(fromToken.balance.toString());
  };
  
  const handleReviewSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return;
    }
    
    if (parseFloat(fromAmount) > fromToken.balance) {
      alert("Insufficient balance");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      swapTokens(
        fromToken.symbol,
        toToken.symbol,
        parseFloat(fromAmount)
      );
      
      setIsLoading(false);
      
      router.push({
        pathname: "/swap-success",
        params: {
          fromAmount,
          fromSymbol: fromToken.symbol,
          toAmount,
          toSymbol: toToken.symbol,
        },
      });
    }, 1500);
  };
  
  const selectFromToken = (token: Token) => {
    setFromToken(token);
    setShowFromTokenModal(false);
  };
  
  const selectToToken = (token: Token) => {
    setToToken(token);
    setShowToTokenModal(false);
  };
  
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });
  
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 12],
  });
  
  const renderTokenModal = (
    visible: boolean, 
    onClose: () => void, 
    onSelect: (token: Token) => void, 
    selectedToken: Token
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
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
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
                  selectedToken.symbol === item.symbol && styles.selectedTokenItem,
                ]}
                onPress={() => onSelect(item)}
              >
              <TokenIcon symbol={item.symbol} size={36} />
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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Swap Tokens</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.slippageContainer}>
          <TouchableOpacity style={styles.slippageButton}>
            <Settings size={16} color={theme.colors.text} />
            <Text style={styles.slippageText}>0.5%</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.refreshButton}>
            <RefreshCw size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* From Token Section */}
          <View style={styles.swapCard}>
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.amountInput}
                  value={fromAmount}
                  onChangeText={handleFromAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>
              
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => setShowFromTokenModal(true)}
              >
              <TokenIcon symbol={fromToken.symbol} size={36} />
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{fromToken.symbol}</Text>
                  <Text style={styles.tokenName}>{fromToken.name}</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.dollarValue}>
              ${fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : "0.00"}
            </Text>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>
                Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}
              </Text>
              <TouchableOpacity
                style={styles.maxButton}
                onPress={handleMaxAmount}
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
                  shadowOpacity,
                  shadowRadius,
                } : {
                  // For web, use a dummy transform to avoid the error
                  transform: [{ translateX: 0 }]
                },
              ]}
            >
              <TouchableOpacity style={styles.swapButton} onPress={handleSwapTokens}>
                <ArrowDown size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* To Token Section */}
          <View style={styles.swapCard}>
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.amountInput}
                  value={toAmount}
                  onChangeText={handleToAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
              </View>
              
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => setShowToTokenModal(true)}
              >
                <TokenIcon symbol={toToken.symbol} size={36} />
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{toToken.symbol}</Text>
                  <Text style={styles.tokenName}>{toToken.name}</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.dollarValue}>
              ${toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : "0.00"}
            </Text>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>
                Balance: {toToken.balance.toFixed(4)} {toToken.symbol}
              </Text>
            </View>
          </View>
          
          {/* Exchange Rate */}
          <View style={styles.exchangeRateCard}>
            <View style={styles.exchangeRateHeader}>
              <Text style={styles.exchangeRateLabel}>Exchange Rate</Text>
              <View style={styles.exchangeRateActions}>
                <TouchableOpacity style={styles.copyButton}>
                  <Copy size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.refreshRateButton}>
                  <RefreshCw size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.exchangeRateRow}>
              <Text style={styles.exchangeRateText}>
                1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.feeRow}>
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Network Fee</Text>
                <Text style={styles.feeValue}>$0.00</Text>
              </View>
              
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Slippage Tolerance</Text>
                <Text style={styles.feeValue}>0.5%</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.reviewButton,
              (!fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > fromToken.balance) && styles.reviewButtonDisabled,
              isLoading && styles.reviewButtonLoading,
            ]}
            onPress={handleReviewSwap}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > fromToken.balance || isLoading}
          >
            <Text style={styles.reviewButtonText}>
              {isLoading ? "Processing..." : "Swap"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Token Selection Modals */}
      {renderTokenModal(showFromTokenModal, () => setShowFromTokenModal(false), selectFromToken, fromToken)}
      {renderTokenModal(showToTokenModal, () => setShowToTokenModal(false), selectToToken, toToken)}
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
    ...theme.typography.h3,
    fontWeight: "600",
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  slippageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  slippageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  slippageText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginLeft: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
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
  tokenIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  tokenIconText: {
    ...theme.typography.h4,
    color: "#fff",
    fontWeight: "bold",
  },
  tokenInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
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
  dollarValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
    marginBottom: theme.spacing.xl,
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
  exchangeRateActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
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
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: theme.spacing.md,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeItem: {
    flex: 1,
  },
  feeLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  feeValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: "600",
  },
  reviewButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xxl,
  },
  reviewButtonDisabled: {
    backgroundColor: "rgba(74, 227, 168, 0.3)",
  },
  reviewButtonLoading: {
    backgroundColor: "rgba(74, 227, 168, 0.7)",
  },
  reviewButtonText: {
    ...theme.typography.h4,
    color: theme.colors.background,
    fontWeight: "600",
    textAlign: "center",
    height: 24,
  },
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
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 16,
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
});