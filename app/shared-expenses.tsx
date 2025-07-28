import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { Plus, Users, ArrowLeft, DollarSign, ArrowUpRight, ArrowDownLeft, Bell } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useSharedExpensesStore, ContactBalance } from "@/store/sharedExpensesStore";
import { useWalletStore } from "@/store/walletStore";
import { router } from "expo-router";

const SharedExpensesScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'you_owe' | 'owed_to_you'>('all');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  const { getContactBalances, sendReminder } = useSharedExpensesStore();
  const { contacts } = useWalletStore();
  const balances = getContactBalances();
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || "Unknown";
  };

  const getContactAvatar = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.avatar;
  };

  const totalYouOwe = balances
    .filter(b => b.netBalance < 0)
    .reduce((sum, b) => sum + Math.abs(b.netBalance), 0);

  const totalOwedToYou = balances
    .filter(b => b.netBalance > 0)
    .reduce((sum, b) => sum + b.netBalance, 0);
    
  const getFilteredBalances = () => {
    switch (activeFilter) {
      case 'you_owe':
        return balances.filter(b => b.netBalance < 0);
      case 'owed_to_you':
        return balances.filter(b => b.netBalance > 0);
      default:
        return balances;
    }
  };
  
  const handleRemindContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      sendReminder(contactId);
      // Show a nice toast-like feedback
      alert(`💬 Reminder sent to ${contact.name}!`);
    }
  };

  const renderBalanceCard = (balance: ContactBalance) => {
    const isOwedToYou = balance.netBalance > 0;
    const amount = Math.abs(balance.netBalance);
    
    return (
      <Animated.View key={balance.contactId} style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.balanceCard}
          onPress={() => router.push(`/shared-expense-detail/${balance.contactId}`)}
          activeOpacity={0.7}
        >
          <View style={styles.balanceCardContent}>
            <View style={styles.contactInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getContactName(balance.contactId).charAt(0)}
                </Text>
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{getContactName(balance.contactId)}</Text>
                <Text style={styles.expenseCount}>
                  {balance.expenses.length} expense{balance.expenses.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            
            <View style={styles.balanceInfo}>
              <View style={styles.balanceAmount}>
                <Text style={[styles.balanceText, isOwedToYou ? styles.positiveText : styles.negativeText]}>
                  {isOwedToYou ? 'owes you' : 'you owe'}
                </Text>
                <Text style={[styles.amountText, isOwedToYou ? styles.positiveAmount : styles.negativeAmount]}>
                  ${amount.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                {isOwedToYou && (
                  <TouchableOpacity
                    style={styles.remindButton}
                    onPress={() => handleRemindContact(balance.contactId)}
                  >
                    <Bell size={14} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
                <View style={[styles.balanceIcon, isOwedToYou ? styles.positiveIcon : styles.negativeIcon]}>
                  {isOwedToYou ? (
                    <ArrowUpRight size={16} color={theme.colors.success} />
                  ) : (
                    <ArrowDownLeft size={16} color={theme.colors.error} />
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filteredBalances = getFilteredBalances();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
        <Text style={styles.headerTitle}>Split</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notification-settings")}
        >
          <Bell size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={[
              styles.summaryCard, 
              styles.owedCard,
              activeFilter === 'you_owe' && styles.activeFilterCard
            ]}
            onPress={() => setActiveFilter(activeFilter === 'you_owe' ? 'all' : 'you_owe')}
          >
            <View style={styles.summaryIcon}>
              <ArrowDownLeft size={20} color={theme.colors.error} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>You owe</Text>
              <Text style={[styles.summaryAmount, styles.negativeAmount]}>
                ${totalYouOwe.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.summaryCard, 
              styles.owedToYouCard,
              activeFilter === 'owed_to_you' && styles.activeFilterCard
            ]}
            onPress={() => setActiveFilter(activeFilter === 'owed_to_you' ? 'all' : 'owed_to_you')}
          >
            <View style={styles.summaryIcon}>
              <ArrowUpRight size={20} color={theme.colors.success} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Owed to you</Text>
              <Text style={[styles.summaryAmount, styles.positiveAmount]}>
                ${totalOwedToYou.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Filter Indicator */}
        {activeFilter !== 'all' && (
          <Animated.View style={[styles.filterIndicator, { opacity: fadeAnim }]}>
            <Text style={styles.filterText}>
              Showing: {activeFilter === 'you_owe' ? 'People you owe' : 'People who owe you'}
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter('all')}>
              <Text style={styles.clearFilterText}>Show All</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Balances List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Outstanding Balances</Text>
            {filteredBalances.length > 0 && (
              <Text style={styles.sectionSubtitle}>
                {filteredBalances.length} contact{filteredBalances.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          {filteredBalances.length === 0 ? (
            <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
              <Users size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {activeFilter === 'all' ? 'No shared expenses yet' : 'No matching balances'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'all' 
                  ? 'Start splitting bills and expenses with your friends'
                  : 'Try changing the filter or add a new expense'
                }
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-expense-step-1')}
              >
                <Plus size={20} color={theme.colors.primary} />
                <Text style={styles.emptyButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.balancesList}>
              {filteredBalances.map(renderBalanceCard)}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-expense-step-1')}
        activeOpacity={0.8}
      >
        <Plus size={24} color={theme.colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },

  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeFilterCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  filterIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  owedCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  owedToYouCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  positiveAmount: {
    color: theme.colors.success,
  },
  negativeAmount: {
    color: theme.colors.error,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  balancesList: {
    gap: 12,
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
  },
  balanceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.background,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  expenseCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remindButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positiveIcon: {
    backgroundColor: 'rgba(74, 227, 168, 0.2)',
  },
  negativeIcon: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
  },
  balanceAmount: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 12,
    marginBottom: 2,
  },
  positiveText: {
    color: theme.colors.success,
  },
  negativeText: {
    color: theme.colors.error,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SharedExpensesScreen;