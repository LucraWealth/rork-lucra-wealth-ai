import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin } from "lucide-react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  
  const handleSave = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    
    // Update profile
    updateUserProfile({
      name,
      email,
      phone,
      address,
    });
    
    // Navigate back
    router.back();
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg" }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              label="Address"
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              containerStyle={styles.input}
            />
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="large"
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
  keyboardAvoid: {
    flex: 1,
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
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.xl,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
  },
});