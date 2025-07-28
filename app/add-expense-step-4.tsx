import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, Edit3, DollarSign, Users, Calendar, NotebookPen } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useWalletStore } from "@/store/walletStore";
import { useSharedExpensesStore, SplitType, calculateSplits } from "@/store/sharedExpensesStore";

const AddExpenseStep4 = () => {
  const params = useLocalSearchParams<{ 
    contacts: string; 
    title: string; 
    emoji: string; 
    amount: string;
    splitType: string;
    customSplits: string;
  }>();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { contacts } = useWalletStore();
  const { addExpense } = useSharedExpensesStore();

  const contactIds = params.contacts ? params.contacts.split(',') : [];
  const selectedContacts = contacts.filter(c => contactIds.includes(c.id));
  const title = decodeURIComponent(params.title || "");
  const emoji = decodeURIComponent(params.emoji || "🍽️");
  const amount = parseFloat(params.amount || "0");
  const splitType = params.splitType as SplitType;
  const customSplits = params.customSplits ? JSON.parse(decodeURIComponent(params.customSplits)) : [];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getSplitTypeLabel = (type: SplitType) => {
    switch (type) {
      case "paid_by_you_split_equally":
        return "You paid, split equally";
      case "paid_by_you_they_owe_full":
        return "You paid, they owe everything";
      case "paid_by_you_custom_split":
        return "You paid, custom split";
      case "paid_by_them_split_equally":
        return "They paid, split equally";
      case "paid_by_them_you_owe_full":
        return "They paid, you owe everything";
      default:
        return "Unknown split type";
    }
  };

  const getCalculatedSplits = () => {
    const currentUserId = "current-user";
    const paidBy = splitType.includes("paid_by_you") ? currentUserId : selectedContacts[0]?.id || currentUserId;
    
    return calculateSplits(
      splitType,
      amount,
      selectedContacts,
      paidBy,
      splitType === "paid_by_you_custom_split" ? customSplits : undefined
    );
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const currentUserId = "current-user";
      const paidBy = splitType.includes("paid_by_you") ? currentUserId : selectedContacts[0]?.id || currentUserId;
      
      const splits = getCalculatedSplits();

      addExpense({
        title: `${emoji} ${title}`,
        totalAmount: amount,
        paidBy,
        category: "General",
        splits
      });

      router.replace('/expense-added-success');
    } catch (error) {
      Alert.alert("Error", "Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const splits = getCalculatedSplits();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Review & Confirm",
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.completedStep]} />
            <View style={[styles.progressStep, styles.completedStep]} />
            <View style={[styles.progressStep, styles.completedStep]} />
            <View style={[styles.progressStep, styles.activeStep]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Review your expense</Text>
          <Text style={styles.subtitle}>
            Double-check the details before adding this expense
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Expense Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseEmoji}>{emoji}</Text>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseTitle}>{title}</Text>
                  <Text style={styles.expenseAmount}>${amount.toFixed(2)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit3 size={16} color={theme.colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Users size={16} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.detailValue}>
                  {selectedContacts.length + 1} people
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <NotebookPen size={16} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.detailValue}>
                  {getSplitTypeLabel(splitType)}
                </Text>
              </View>

              {splits.map(split => {
                const contact = selectedContacts.find(c => c.id === split.contactId);
                const isCurrentUser = split.contactId === "current-user";
                
                return (
                  <View key={split.contactId} style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <DollarSign size={16} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.detailValue}>
                      {isCurrentUser 
                        ? `You owe ${split.amount.toFixed(2)}`
                        : `${contact?.name || 'Unknown'} owes you ${split.amount.toFixed(2)}`
                      }
                    </Text>
                  </View>
                );
              })}

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Calendar size={16} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Participants List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who's involved</Text>
            <View style={styles.participantsList}>
              {selectedContacts.map(contact => (
                <View key={contact.id} style={styles.participantCard}>
                  <View style={styles.participantInfo}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {contact.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.participantName}>{contact.name}</Text>
                  </View>
                  <View style={styles.participantRole}>
                    <Text style={styles.roleText}>Participant</Text>
                  </View>
                </View>
              ))}
              
              {/* Current User */}
              <View style={styles.participantCard}>
                <View style={styles.participantInfo}>
                  <View style={[styles.participantAvatar, styles.currentUserAvatar]}>
                    <Text style={styles.participantAvatarText}>Y</Text>
                  </View>
                  <Text style={styles.participantName}>You</Text>
                </View>
                <View style={styles.participantRole}>
                  <Text style={[styles.roleText, styles.paidByText]}>
                    {splitType.includes("paid_by_you") ? "Paid" : "Participant"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Split Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Split breakdown</Text>
            <View style={styles.splitBreakdown}>
              {splits.map(split => {
                const contact = selectedContacts.find(c => c.id === split.contactId);
                return (
                  <View key={split.contactId} style={styles.splitItem}>
                    <View style={styles.splitContactInfo}>
                      <View style={styles.splitAvatar}>
                        <Text style={styles.splitAvatarText}>
                          {contact?.name.charAt(0) || 'Y'}
                        </Text>
                      </View>
                      <View style={styles.splitDetails}>
                        <Text style={styles.splitContactName}>
                          {contact?.name || 'You'}
                        </Text>
                        <Text style={styles.splitPercentage}>
                          {split.percentage.toFixed(1)}% of total
                        </Text>
                      </View>
                    </View>
                    <View style={styles.splitAmountContainer}>
                      <Text style={styles.splitAmount}>
                        ${split.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.splitStatus}>
                        {split.contactId === "current-user" ? "You owe" : "Owes you"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isSubmitting && styles.disabledButton
          ]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          <Text style={[
            styles.confirmButtonText,
            isSubmitting && styles.disabledButtonText
          ]}>
            {isSubmitting ? "Adding..." : "Confirm Expense"}
          </Text>
          <Check size={20} color={
            isSubmitting ? theme.colors.textSecondary : theme.colors.background
          } />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  splitRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary + '30',
    marginBottom: 4,
  },
  splitRowName: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  splitRowAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border + '30',
    borderRadius: 2,
  },
  activeStep: {
    backgroundColor: theme.colors.primary,
  },
  completedStep: {
    backgroundColor: theme.colors.success,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border + '30',
    marginBottom: 16,
  },
  summaryDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    width: "100%",
    overflow: 'hidden',
    color: theme.colors.text,
  },
  detailValueText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentUserAvatar: {
    backgroundColor: theme.colors.success,
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  participantRole: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  paidByText: {
    color: theme.colors.success,
    backgroundColor: theme.colors.success + '15',
  },
  splitBreakdown: {
    gap: 12,
  },
  splitItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  splitContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  splitAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  splitAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background,
  },
  splitDetails: {
    flex: 1,
  },
  splitContactName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  splitPercentage: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  splitAmountContainer: {
    alignItems: 'flex-end',
  },
  splitAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  splitStatus: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '20',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: theme.colors.border + '30',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  disabledButtonText: {
    color: theme.colors.textSecondary,
  },
});

export default AddExpenseStep4;