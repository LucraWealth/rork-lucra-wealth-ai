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
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ArrowRight, Smile, Receipt, Coffee, Car, Home, ShoppingBag, Plane, Heart, MoreHorizontal } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useWalletStore } from "@/store/walletStore";

const AddExpenseStep2 = () => {
  const params = useLocalSearchParams<{ contacts: string }>();
  const [title, setTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🍽️");
  const [fadeAnim] = useState(new Animated.Value(0));
  const { contacts } = useWalletStore();

  const contactIds = params.contacts ? params.contacts.split(',') : [];
  const selectedContacts = contacts.filter(c => contactIds.includes(c.id));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const expenseIcons = [
    { emoji: "🍽️", label: "Food", icon: Coffee },
    { emoji: "🚗", label: "Transport", icon: Car },
    { emoji: "🏠", label: "Home", icon: Home },
    { emoji: "🛍️", label: "Shopping", icon: ShoppingBag },
    { emoji: "✈️", label: "Travel", icon: Plane },
    { emoji: "🎬", label: "Entertainment", icon: Receipt },
    { emoji: "💊", label: "Health", icon: Heart },
    { emoji: "📱", label: "Other", icon: MoreHorizontal },
  ];

  const handleNext = () => {
    if (!title.trim()) {
      alert("Please enter a description for the expense.");
      return;
    }
    
    router.push(`/add-expense-step-3?contacts=${params.contacts}&title=${encodeURIComponent(title.trim())}&emoji=${encodeURIComponent(selectedEmoji)}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Add Description",
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
            <View style={[styles.progressStep, styles.activeStep]} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What's this expense for?</Text>
          <Text style={styles.subtitle}>
            Add a description and choose an icon to represent this expense
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Selected Contacts Preview */}
          <View style={styles.contactsPreview}>
            <Text style={styles.previewLabel}>Splitting with:</Text>
            <View style={styles.contactsRow}>
              {selectedContacts.map(contact => (
                <View key={contact.id} style={styles.contactChip}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>
                      {contact.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.contactName}>{contact.name.split(' ')[0]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Expense Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose an Icon</Text>
            <View style={styles.iconGrid}>
              {expenseIcons.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconCard,
                    selectedEmoji === item.emoji && styles.selectedIconCard
                  ]}
                  onPress={() => setSelectedEmoji(item.emoji)}
                >
                  <Text style={styles.iconEmoji}>{item.emoji}</Text>
                  <Text style={styles.iconLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.inputContainer}>
              <View style={styles.emojiPreview}>
                <Text style={styles.emojiPreviewText}>{selectedEmoji}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Dinner at Olive Garden"
                placeholderTextColor={theme.colors.placeholder}
                multiline
                numberOfLines={2}
                maxLength={100}
              />
            </View>
            <Text style={styles.characterCount}>
              {title.length}/100 characters
            </Text>
          </View>

          {/* Quick Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Suggestions</Text>
            <View style={styles.suggestionsGrid}>
              {[
                "Dinner at restaurant",
                "Grocery shopping",
                "Gas for road trip",
                "Movie tickets",
                "Uber ride",
                "Coffee & snacks"
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => setTitle(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
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
            styles.nextButton,
            !title.trim() && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!title.trim()}
        >
          <Text style={[
            styles.nextButtonText,
            !title.trim() && styles.disabledButtonText
          ]}>
            Continue
          </Text>
          <ArrowRight size={20} color={
            !title.trim() ? theme.colors.textSecondary : theme.colors.background
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
  contactsPreview: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  contactAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.background,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  selectedIconCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  iconEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    gap: 12,
  },
  emojiPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPreviewText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 40,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
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

export default AddExpenseStep2;