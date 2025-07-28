import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  TextInput,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, DollarSign, Users, Percent, Calculator } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useWalletStore } from "@/store/walletStore";
import { useSharedExpensesStore, SplitType, calculateSplits } from "@/store/sharedExpensesStore";

const AddExpenseStep3 = () => {
  const params = useLocalSearchParams<{ 
    contacts: string; 
    title: string; 
    emoji: string; 
  }>();
  
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("paid_by_you_split_equally");
  const [customSplits, setCustomSplits] = useState<{ contactId: string; percentage: number }[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  
  const { contacts } = useWalletStore();
  const { addExpense } = useSharedExpensesStore();

  const contactIds = params.contacts ? params.contacts.split(',') : [];
  const selectedContacts = contacts.filter(c => contactIds.includes(c.id));
  const title = decodeURIComponent(params.title || "");
  const emoji = decodeURIComponent(params.emoji || "🍽️");

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    if (splitType === "paid_by_you_custom_split" && selectedContacts.length > 0) {
      const equalPercentage = Math.floor(100 / selectedContacts.length);
      const remainder = 100 - (equalPercentage * selectedContacts.length);
      
      // Only initialize if customSplits is empty or doesn't match current contacts
      if (customSplits.length === 0 || 
          customSplits.length !== selectedContacts.length ||
          !selectedContacts.every(contact => customSplits.some(split => split.contactId === contact.id))) {
        setCustomSplits(selectedContacts.map((contact, index) => ({
          contactId: contact.id,
          percentage: index === 0 ? equalPercentage + remainder : equalPercentage
        })));
      }
    } else if (splitType !== "paid_by_you_custom_split") {
      setCustomSplits([]);
    }
  }, [splitType, selectedContacts.length, contactIds.join(',')]);

  const splitTypeOptions = [
    { 
      value: "paid_by_you_split_equally", 
      label: "I paid, split equally",
      description: "Everyone pays their fair share"
    },
    { 
      value: "paid_by_you_they_owe_full", 
      label: "I paid, they owe everything",
      description: "Others pay the full amount"
    },
    { 
      value: "paid_by_you_custom_split", 
      label: "I paid, custom split",
      description: "Set custom percentages"
    },
    { 
      value: "paid_by_them_split_equally", 
      label: "They paid, split equally",
      description: "I pay my fair share"
    },
    { 
      value: "paid_by_them_you_owe_full", 
      label: "They paid, I owe everything",
      description: "I pay the full amount"
    },
  ];

  const handleCustomSplitChange = (contactId: string, percentage: number) => {
    setCustomSplits(prev => 
      prev.map(split => 
        split.contactId === contactId 
          ? { ...split, percentage: Math.min(100, Math.max(0, percentage)) }
          : split
      )
    );
  };

  const getTotalCustomPercentage = () => {
    return customSplits.reduce((sum, split) => sum + split.percentage, 0);
  };

  const getPreviewSplits = () => {
    if (!amount || parseFloat(amount) <= 0) return [];
    
    const currentUserId = "current-user";
    const paidBy = splitType.includes("paid_by_you") ? currentUserId : selectedContacts[0]?.id || currentUserId;
    
    return calculateSplits(
      splitType,
      parseFloat(amount),
      selectedContacts,
      paidBy,
      splitType === "paid_by_you_custom_split" ? customSplits : undefined
    );
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (splitType === "paid_by_you_custom_split") {
      const totalPercentage = getTotalCustomPercentage();
      if (totalPercentage !== 100) {
        Alert.alert("Error", `Custom split percentages must add up to 100%. Current total: ${totalPercentage}%`);
        return;
      }
    }

    const currentUserId = "current-user";
    const paidBy = splitType.includes("paid_by_you") ? currentUserId : selectedContacts[0]?.id || currentUserId;
    
    const splits = calculateSplits(
      splitType,
      parseFloat(amount),
      selectedContacts,
      paidBy,
      splitType === "paid_by_you_custom_split" ? customSplits : undefined
    );

    addExpense({
      title: `${emoji} ${title}`,
      totalAmount: parseFloat(amount),
      paidBy,
      category: "General",
      splits
    });

    // Navigate to Step 4 (Summary)
    router.push(`/add-expense-step-4?contacts=${params.contacts}&title=${encodeURIComponent(title)}&emoji=${encodeURIComponent(emoji)}&amount=${amount}&splitType=${splitType}&customSplits=${encodeURIComponent(JSON.stringify(customSplits))}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Amount & Split",
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
            <View style={[styles.progressStep, styles.activeStep]} />
            <View style={styles.progressStep} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How much and how to split?</Text>
          <Text style={styles.subtitle}>
            Enter the total amount and choose how to split it
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Expense Preview */}
          <View style={styles.expensePreview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
              <View style={styles.previewDetails}>
                <Text style={styles.previewTitle}>{title}</Text>
                <Text style={styles.previewContacts}>
                  With {selectedContacts.map(c => c.name.split(' ')[0]).join(', ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Total Amount</Text>
            <View style={styles.amountContainer}>
              <DollarSign size={24} color={theme.colors.primary} />
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Split Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Split</Text>
            <View style={styles.splitOptions}>
              {splitTypeOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.splitOption,
                    splitType === option.value && styles.selectedSplitOption
                  ]}
                  onPress={() => setSplitType(option.value as SplitType)}
                >
                  <View style={styles.splitOptionContent}>
                    <Text style={[
                      styles.splitOptionLabel,
                      splitType === option.value && styles.selectedSplitOptionLabel
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.splitOptionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={[styles.radio, splitType === option.value && styles.selectedRadio]}>
                    {splitType === option.value && <Check size={16} color={theme.colors.background} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Split Controls */}
          {splitType === "paid_by_you_custom_split" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Split Percentages</Text>
              <View style={styles.customSplitContainer}>
                {selectedContacts.map(contact => {
                  const split = customSplits.find(s => s.contactId === contact.id);
                  const percentage = split?.percentage || 0;
                  const calculatedAmount = amount ? (parseFloat(amount) * percentage) / 100 : 0;
                  
                  return (
                    <View key={contact.id} style={styles.customSplitItem}>
                      <View style={styles.customSplitContact}>
                        <View style={styles.contactAvatar}>
                          <Text style={styles.contactAvatarText}>
                            {contact.name.charAt(0)}
                          </Text>
                        </View>
                        <Text style={styles.contactName}>{contact.name}</Text>
                      </View>
                      
                      <View style={styles.customSplitControls}>
                        <View style={styles.percentageContainer}>
                          <TextInput
                            style={styles.percentageInput}
                            value={percentage.toString()}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 0;
                              handleCustomSplitChange(contact.id, num);
                            }}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          <Percent size={16} color={theme.colors.textSecondary} />
                        </View>
                        <Text style={styles.calculatedAmount}>
                          ${calculatedAmount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                
                <View style={styles.totalPercentage}>
                  <Text style={[
                    styles.totalPercentageText,
                    getTotalCustomPercentage() === 100 ? styles.validTotal : styles.invalidTotal
                  ]}>
                    Total: {getTotalCustomPercentage()}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Live Split Preview */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Split Preview</Text>
              <View style={styles.splitPreview}>
                {getPreviewSplits().map(split => {
                  const contact = selectedContacts.find(c => c.id === split.contactId);
                  return (
                    <View key={split.contactId} style={styles.previewItem}>
                      <View style={styles.previewContactInfo}>
                        <View style={styles.previewAvatar}>
                          <Text style={styles.previewAvatarText}>
                            {contact?.name.charAt(0) || 'Y'}
                          </Text>
                        </View>
                        <Text style={styles.previewContactName}>
                          {contact?.name || 'You'}
                        </Text>
                      </View>
                      <Text style={styles.previewAmount}>
                        ${split.amount.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
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
            styles.submitButton,
            (!amount || parseFloat(amount) <= 0) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          <Text style={[
            styles.submitButtonText,
            (!amount || parseFloat(amount) <= 0) && styles.disabledButtonText
          ]}>
            Continue
          </Text>
          <Check size={20} color={
            (!amount || parseFloat(amount) <= 0) ? theme.colors.textSecondary : theme.colors.background
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
  expensePreview: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  previewEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  previewDetails: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  previewContacts: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  amountInput: {
    flex: 1,
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
  },
  splitOptions: {
    gap: 12,
  },
  splitOption: {
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSplitOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  splitOptionContent: {
    flex: 1,
  },
  splitOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedSplitOptionLabel: {
    color: theme.colors.primary,
  },
  splitOptionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  customSplitContainer: {
    gap: 12,
  },
  customSplitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  customSplitContact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  customSplitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  percentageInput: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 40,
  },
  calculatedAmount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    minWidth: 60,
    textAlign: 'right',
  },
  totalPercentage: {
    alignItems: 'center',
    marginTop: 8,
  },
  totalPercentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  validTotal: {
    color: theme.colors.success,
  },
  invalidTotal: {
    color: theme.colors.error,
  },

  splitPreview: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '20',
  },
  previewContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background,
  },
  previewContactName: {
    fontSize: 16,
    color: theme.colors.text,
  },
  previewAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
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
  submitButton: {
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  disabledButtonText: {
    color: theme.colors.textSecondary,
  },
});

export default AddExpenseStep3;