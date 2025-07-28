import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Check, ChevronDown, X, Plus, Minus, ArrowLeft, Receipt } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useSharedExpensesStore, SplitType, calculateSplits } from "@/store/sharedExpensesStore";
import { useWalletStore, Contact } from "@/store/walletStore";

const AddSharedExpenseScreen = () => {
  const params = useLocalSearchParams<{
    prefillTitle?: string;
    prefillAmount?: string;
    prefillCategory?: string;
    prefillDescription?: string;
  }>();
  
  const [title, setTitle] = useState(params.prefillTitle || "");
  const [amount, setAmount] = useState(params.prefillAmount || "");
  const [description, setDescription] = useState(params.prefillDescription || "");
  const [category, setCategory] = useState(params.prefillCategory || "General");
  const [splitType, setSplitType] = useState<SplitType>("paid_by_you_split_equally");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [customSplits, setCustomSplits] = useState<{ contactId: string; percentage: number }[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showSplitTypePicker, setShowSplitTypePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { addExpense } = useSharedExpensesStore();
  const { contacts } = useWalletStore();

  const categories = [
    "General", "Food & Dining", "Transportation", "Entertainment", 
    "Utilities", "Shopping", "Travel", "Health", "Other"
  ];

  const splitTypeOptions = [
    { value: "paid_by_you_split_equally", label: "Paid by you, split equally" },
    { value: "paid_by_you_they_owe_full", label: "Paid by you, they owe full amount" },
    { value: "paid_by_you_custom_split", label: "Paid by you, custom split" },
    { value: "paid_by_them_split_equally", label: "Paid by them, split equally" },
    { value: "paid_by_them_you_owe_full", label: "Paid by them, you owe full amount" },
  ];

  const handleContactToggle = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
      setCustomSplits(prev => prev.filter(s => s.contactId !== contact.id));
    } else {
      setSelectedContacts(prev => [...prev, contact]);
      if (splitType === "paid_by_you_custom_split") {
        setCustomSplits(prev => [...prev, { contactId: contact.id, percentage: 0 }]);
      }
    }
  };

  const handleCustomSplitChange = (contactId: string, percentage: number) => {
    setCustomSplits(prev => 
      prev.map(split => 
        split.contactId === contactId 
          ? { ...split, percentage }
          : split
      )
    );
  };

  const getTotalCustomPercentage = () => {
    return customSplits.reduce((sum, split) => sum + split.percentage, 0);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the expense");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (selectedContacts.length === 0) {
      Alert.alert("Error", "Please select at least one contact");
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
      title: title.trim(),
      totalAmount: parseFloat(amount),
      paidBy,
      category,
      description: description.trim() || undefined,
      splits
    });

    // Navigate to success screen instead of showing alert
    router.replace('/expense-added-success');
  };

  const renderContactPicker = () => {
    if (!showContactPicker) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Contacts</Text>
            <TouchableOpacity onPress={() => setShowContactPicker(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerContent}>
            {contacts.map(contact => {
              const isSelected = selectedContacts.some(c => c.id === contact.id);
              return (
                <TouchableOpacity
                  key={contact.id}
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => handleContactToggle(contact)}
                >
                  <View style={styles.contactItem}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>
                        {contact.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.contactName}>{contact.name}</Text>
                  </View>
                  {isSelected && <Check size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderSplitTypePicker = () => {
    if (!showSplitTypePicker) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Split Type</Text>
            <TouchableOpacity onPress={() => setShowSplitTypePicker(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerContent}>
            {splitTypeOptions.map(option => {
              const isSelected = splitType === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => {
                    setSplitType(option.value as SplitType);
                    setShowSplitTypePicker(false);
                    
                    // Reset custom splits when changing split type
                    if (option.value === "paid_by_you_custom_split") {
                      setCustomSplits(selectedContacts.map(contact => ({
                        contactId: contact.id,
                        percentage: Math.floor(100 / selectedContacts.length)
                      })));
                    } else {
                      setCustomSplits([]);
                    }
                  }}
                >
                  <Text style={styles.pickerItemText}>{option.label}</Text>
                  {isSelected && <Check size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCategoryPicker = () => {
    if (!showCategoryPicker) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerContent}>
            {categories.map(cat => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{cat}</Text>
                  {isSelected && <Check size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCustomSplits = () => {
    if (splitType !== "paid_by_you_custom_split" || selectedContacts.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Split Percentages</Text>
        {selectedContacts.map(contact => {
          const split = customSplits.find(s => s.contactId === contact.id);
          const percentage = split?.percentage || 0;
          const calculatedAmount = (parseFloat(amount || "0") * percentage) / 100;
          
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
                <View style={styles.percentageInput}>
                  <TextInput
                    style={styles.percentageTextInput}
                    value={percentage.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      handleCustomSplitChange(contact.id, Math.min(100, Math.max(0, num)));
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.percentageSymbol}>%</Text>
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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Add Shared Expense",
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/view-transactions-for-split')}
              style={styles.headerButton}
            >
              <Receipt size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expense Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Dinner at restaurant"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={styles.pickerText}>{category}</Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Split Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>How to Split *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowSplitTypePicker(true)}
            >
              <Text style={styles.pickerText}>
                {splitTypeOptions.find(opt => opt.value === splitType)?.label}
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Contacts */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Split With *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowContactPicker(true)}
            >
              <Text style={styles.pickerText}>
                {selectedContacts.length === 0 
                  ? "Select contacts" 
                  : `${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''} selected`
                }
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            {selectedContacts.length > 0 && (
              <View style={styles.selectedContacts}>
                {selectedContacts.map(contact => (
                  <View key={contact.id} style={styles.selectedContact}>
                    <Text style={styles.selectedContactText}>{contact.name}</Text>
                    <TouchableOpacity onPress={() => handleContactToggle(contact)}>
                      <X size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Custom Splits */}
          {renderCustomSplits()}

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes about this expense..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Pickers */}
      {renderContactPicker()}
      {renderSplitTypePicker()}
      {renderCategoryPicker()}
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border + '20',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border + '20',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  selectedContacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  selectedContact: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  selectedContactText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  customSplitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 18,
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
  customSplitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  percentageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  percentageTextInput: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 40,
  },
  percentageSymbol: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 2,
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
  footer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '20',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pickerContent: {
    maxHeight: 400,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background,
  },
  contactName: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default AddSharedExpenseScreen;