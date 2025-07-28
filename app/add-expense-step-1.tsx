import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { Stack, router } from "expo-router";
import { ArrowLeft, ArrowRight, Plus, Check, Users } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useWalletStore, Contact } from "@/store/walletStore";

const AddExpenseStep1 = () => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { contacts } = useWalletStore();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContactToggle = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts(prev => [...prev, contact]);
    }
  };

  const handleNext = () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to continue.");
      return;
    }
    
    // Pass selected contacts to next step
    const contactIds = selectedContacts.map(c => c.id).join(',');
    router.push(`/add-expense-step-2?contacts=${contactIds}`);
  };

  const handleBack = () => {
      router.back();
  };

  const handleAddNewContact = () => {
    router.push('/add-contact');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Select Contacts",
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
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
            <View style={[styles.progressStep, styles.activeStep]} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Who are you splitting with?</Text>
          <Text style={styles.subtitle}>
            Select the people you want to split this expense with
          </Text>
        </View>

        {/* Selected Contacts Summary */}
        {selectedContacts.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.selectedCount}>
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedList}>
              {selectedContacts.map(contact => (
                <View key={contact.id} style={styles.selectedChip}>
                  <View style={styles.chipAvatar}>
                    <Text style={styles.chipAvatarText}>
                      {contact.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.chipName}>{contact.name.split(' ')[0]}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contacts List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Contacts</Text>
              <TouchableOpacity
                style={styles.addContactButton}
                onPress={handleAddNewContact}
              >
                <Plus size={16} color={theme.colors.primary} />
                <Text style={styles.addContactText}>Add New</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contactsList}>
              {contacts.map(contact => {
                const isSelected = selectedContacts.some(c => c.id === contact.id);
                return (
                  <TouchableOpacity
                    key={contact.id}
                    style={[styles.contactCard, isSelected && styles.selectedContactCard]}
                    onPress={() => handleContactToggle(contact)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactInfo}>
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactAvatarText}>
                          {contact.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactEmail}>{contact.email}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                      {isSelected && <Check size={16} color={theme.colors.background} />}
                    </View>
                  </TouchableOpacity>
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
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedContacts.length === 0 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedContacts.length === 0}
        >
          <Text style={[
            styles.nextButtonText,
            selectedContacts.length === 0 && styles.disabledButtonText
          ]}>
            Continue
          </Text>
          <ArrowRight size={20} color={
            selectedContacts.length === 0 ? theme.colors.textSecondary : theme.colors.background
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
    backgroundColor: 'transparent',
    marginLeft: -8,
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
  selectedSummary: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  selectedList: {
    flexDirection: 'row',
  },
  selectedChip: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  chipAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  chipAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  chipName: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addContactText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
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
  selectedContactCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.background,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
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
  nextButton: {
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  disabledButtonText: {
    color: theme.colors.textSecondary,
  },
});

export default AddExpenseStep1;