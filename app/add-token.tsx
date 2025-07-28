import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";
import { ArrowLeft, Search, AlertCircle, CheckCircle } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

interface Token {
  id: string;
  name: string;
  symbol: string;
  network: string;
  iconUrl: string;
  price: number;
}

export default function AddTokenScreen() {
  const router = useRouter();
  const { addToken } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Mock token list
  const availableTokens: Token[] = [
    {
      id: "bnb",
      name: "Binance Coin",
      symbol: "BNB",
      network: "Binance Smart Chain",
      iconUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=025",
      price: 320.50,
    },
    {
      id: "link",
      name: "Chainlink",
      symbol: "LINK",
      network: "Ethereum",
      iconUrl: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=025",
      price: 15.75,
    },
    {
      id: "uni",
      name: "Uniswap",
      symbol: "UNI",
      network: "Ethereum",
      iconUrl: "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=025",
      price: 8.90,
    },
    {
      id: "matic",
      name: "Polygon",
      symbol: "MATIC",
      network: "Polygon",
      iconUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025",
      price: 0.85,
    },
    {
      id: "avax",
      name: "Avalanche",
      symbol: "AVAX",
      network: "Avalanche",
      iconUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025",
      price: 42.30,
    },
    {
      id: "dot",
      name: "Polkadot",
      symbol: "DOT",
      network: "Polkadot",
      iconUrl: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png?v=025",
      price: 7.25,
    },
    {
      id: "ada",
      name: "Cardano",
      symbol: "ADA",
      network: "Cardano",
      iconUrl: "https://cryptologos.cc/logos/cardano-ada-logo.png?v=025",
      price: 0.45,
    },
  ];

  const filteredTokens = searchQuery
    ? availableTokens.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTokens;

  const handleAddToken = async () => {
    if (!selectedToken) return;
    
    setIsAdding(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        addToken({
          name: selectedToken.name,
          symbol: selectedToken.symbol,
          price: selectedToken.price,
          change: Math.random() * 10 - 5, // Random change between -5% and +5%
          iconUrl: selectedToken.iconUrl,
          description: `${selectedToken.name} token on ${selectedToken.network}`,
        });
        
        Alert.alert(
          "Success!",
          `${selectedToken.name} (${selectedToken.symbol}) has been added to your wallet!`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } catch (error) {
        Alert.alert("Error", "Failed to add token. Please try again.");
      } finally {
        setIsAdding(false);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Token</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tokens by name or symbol"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <AlertCircle size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              Select a token from the list below or search by name or symbol
            </Text>
          </View>

          <View style={styles.tokenList}>
            {filteredTokens.map((token) => (
              <TouchableOpacity
                key={token.id}
                style={[
                  styles.tokenItem,
                  selectedToken?.id === token.id && styles.selectedTokenItem,
                ]}
                onPress={() => setSelectedToken(token)}
              >
                <View style={styles.tokenIcon}>
                  <Text style={styles.tokenIconText}>{token.symbol.charAt(0)}</Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                </View>
                <View style={styles.tokenRight}>
                  <Text style={styles.tokenPrice}>${token.price.toFixed(2)}</Text>
                  <Text style={styles.tokenNetwork}>{token.network}</Text>
                </View>
                {selectedToken?.id === token.id && (
                  <View style={styles.selectedIndicator}>
                    <CheckCircle size={20} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {filteredTokens.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tokens found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isAdding ? "Adding Token..." : "Add Token"}
            onPress={handleAddToken}
            variant="primary"
            size="large"
            disabled={!selectedToken}
            loading={isAdding}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
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
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  searchContainer: {
    marginBottom: theme.spacing.lg,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  tokenList: {
    marginBottom: theme.spacing.xl,
  },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    position: "relative",
  },
  selectedTokenItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(74, 227, 168, 0.05)",
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  tokenIconText: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    ...theme.typography.body,
    fontWeight: "600",
  },
  tokenSymbol: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  tokenRight: {
    alignItems: "flex-end",
    marginRight: theme.spacing.md,
  },
  tokenPrice: {
    ...theme.typography.body,
    fontWeight: "600",
    color: theme.colors.text,
  },
  tokenNetwork: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: 2,
  },
  selectedIndicator: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});