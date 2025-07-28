import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput as RNTextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import ContactItem from "@/components/ContactItem";
import { ArrowLeft, Search, Plus, DollarSign, MessageSquare } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function RequestMoneyScreen() {
  const router = useRouter();
  const { contacts = [] } = useWalletStore();
  
  const [step, setStep] = useState(1); // 1: Select contact, 2: Enter amount, 3: Add note
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Screen entry animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Step transition animation
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    // Animate step transitions
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);
  
  const filteredContacts = contacts && contacts.length > 0 
    ? contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.phone && contact.phone.includes(searchQuery)) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) 
    : [];
  
  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    setStep(2);
  };
  
  const handleAddContact = () => {
    router.push("/add-contact");
  };
  
  const handleContinueToNote = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    setStep(3);
  };
  
  const handleRequestMoney = () => {
    if (!selectedContact || !amount || parseFloat(amount) <= 0) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: "/request-success",
        params: {
          amount,
          recipient: selectedContact.name,
          note: note || "Money request",
        },
      });
    }, 1500);
  };
  
  const renderStep1 = () => (
    <>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search contacts"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.textSecondary} />}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>
      
      <View style={styles.contactsHeader}>
        <Text style={styles.contactsTitle}>Contacts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Plus size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {contacts && contacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactItem
              id={item.id}
              name={item.name}
              email={item.email}
              avatar={item.avatar}
              onPress={() => handleContactSelect(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No contacts found</Text>
              <Button
                title="Add New Contact"
                onPress={handleAddContact}
                variant="outline"
                size="small"
                style={styles.emptyButton}
              />
            </View>
          }
          contentContainerStyle={styles.contactsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contacts found</Text>
          <Button
            title="Add New Contact"
            onPress={handleAddContact}
            variant="outline"
            size="small"
            style={styles.emptyButton}
          />
        </View>
      )}
    </>
  );
  
  const renderStep2 = () => (
    <View style={styles.amountContainer}>
      <View style={styles.selectedContactContainer}>
        <Text style={styles.stepTitle}>Request from</Text>
        <ContactItem
          id={selectedContact.id}
          name={selectedContact.name}
          email={selectedContact.email}
          avatar={selectedContact.avatar}
          onPress={() => {}}
        />
      </View>
      
      <Text style={styles.stepTitle}>Amount</Text>
      <View style={styles.amountInputContainer}>
        <View style={styles.dollarSignContainer}>
          <DollarSign size={24} color={theme.colors.text} />
        </View>
        <RNTextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          placeholderTextColor={theme.colors.textSecondary}
          autoFocus
        />
      </View>
      
      <Button
        title="Continue"
        onPress={handleContinueToNote}
        variant="primary"
        size="large"
        disabled={!amount || parseFloat(amount) <= 0}
        style={styles.continueButton}
      />
      
      <Button
        title="Back to Contacts"
        onPress={() => setStep(1)}
        variant="text"
        style={styles.backButton}
      />
    </View>
  );
  
  const renderStep3 = () => (
    <View style={styles.noteContainer}>
      <View style={styles.selectedContactContainer}>
        <Text style={styles.stepTitle}>Request from</Text>
        <ContactItem
          id={selectedContact.id}
          name={selectedContact.name}
          email={selectedContact.email}
          avatar={selectedContact.avatar}
          onPress={() => {}}
        />
      </View>
      
      <View style={styles.amountSummary}>
        <Text style={styles.amountSummaryLabel}>Amount</Text>
        <Text style={styles.amountSummaryValue}>${parseFloat(amount).toFixed(2)}</Text>
      </View>
      
      <Text style={styles.stepTitle}>Add a Note (Optional)</Text>
      <View style={styles.noteInputContainer}>
        <MessageSquare size={20} color={theme.colors.textSecondary} style={styles.noteIcon} />
        <RNTextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="What's this request for?"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          autoFocus
        />
      </View>
      
      <Button
        title="Request Money"
        onPress={handleRequestMoney}
        variant="primary"
        size="large"
        loading={isLoading}
        style={styles.requestButton}
      />
      
      <Button
        title="Back to Amount"
        onPress={() => setStep(2)}
        variant="text"
        style={styles.backButton}
      />
    </View>
  );
  
  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Money</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <KeyboardAvoidingView
            style={styles.content}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          >
            <Animated.View style={{ flex: 1, transform: [{ translateY: slideAnim }] }}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Animated.View>
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
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
 backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  contactsTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  contactsList: {
    paddingBottom: theme.spacing.xxl,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
  amountContainer: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  selectedContactContainer: {
    marginBottom: theme.spacing.xl,
  },
  stepTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  dollarSignContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text,
  },
  continueButton: {
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginBottom: theme.spacing.xxl,
  },
  noteContainer: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  amountSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  amountSummaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  amountSummaryValue: {
    ...theme.typography.h3,
    fontWeight: "700",
    color: theme.colors.text,
  },
  noteInputContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: "flex-start",
  },
  noteIcon: {
    marginTop: 4,
    marginRight: theme.spacing.md,
  },
  noteInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 80,
  },
  requestButton: {
    marginBottom: theme.spacing.md,
  },
});