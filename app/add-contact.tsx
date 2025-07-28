import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
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
import TextInput from "@/components/TextInput";
import { ArrowLeft, User, Mail, Phone, AtSign } from "lucide-react-native";
import { useWalletStore } from "@/store/walletStore";

export default function AddContactScreen() {
  const router = useRouter();
  const { addContact } = useWalletStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const isFormValid = name.trim() !== "" && (email.trim() !== "" || phone.trim() !== "");
  
  const handleSaveContact = () => {
    if (!isFormValid) {
      Alert.alert(
        "Missing Information",
        "Please provide at least a name and either an email or phone number."
      );
      return;
    }
    
    setIsLoading(true);
    
    // Add contact to store
    const newContact = {
      name,
      email,
      phone,
      handle,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`
    };
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Check if addContact exists
        if (typeof addContact !== 'function') {
          Alert.alert(
            "Error",
            "This feature is currently unavailable. Please try again later."
          );
          setIsLoading(false);
          return;
        }
        
        // Add the contact to the store
        addContact(newContact);
        
        setIsLoading(false);
        
        Alert.alert(
          "Contact Added",
          `${name} has been added to your contacts.`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } catch (error) {
        setIsLoading(false);
        Alert.alert("Error", "An error occurred while adding the contact.");
      }
    }, 1000);
  };
  
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
          <Text style={styles.headerTitle}>Add Contact</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              icon={<User size={20} color={theme.colors.textSecondary} />}
              autoCapitalize="words"
              required
            />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              icon={<Mail size={20} color={theme.colors.textSecondary} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              icon={<Phone size={20} color={theme.colors.textSecondary} />}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Lucra Handle (Optional)"
              value={handle}
              onChangeText={setHandle}
              placeholder="Enter Lucra handle"
              icon={<AtSign size={20} color={theme.colors.textSecondary} />}
              autoCapitalize="none"
            />
          </View>
          
          <Button
            title="Save Contact"
            onPress={handleSaveContact}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={!isFormValid}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: theme.spacing.xxl,
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});