import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput as RNTextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Search,
  ExternalLink,
  ArrowLeft
} from "lucide-react-native";

// FAQ data
const faqs = [
  {
    id: "1",
    question: "How do I add money to my wallet?",
    answer: "You can add money to your wallet by linking a bank account or debit card and initiating a transfer. Go to the Wallet tab, tap on 'Add Money', select your funding source, enter the amount, and confirm the transaction."
  },
  {
    id: "2",
    question: "How do I send money to someone?",
    answer: "To send money, go to the Payments tab and tap on 'Send Money'. Enter the recipient's email or phone number, the amount you want to send, add an optional note, and confirm the transaction."
  },
  {
    id: "3",
    question: "What are the fees for transactions?",
    answer: "Standard transfers between wallets are free. Bank transfers typically take 1-3 business days and are free. Instant transfers to your bank account incur a 1.5% fee (minimum $0.25, maximum $15)."
  },
  {
    id: "4",
    question: "How do I buy or sell tokens?",
    answer: "To buy or sell tokens, go to the Tokens tab, select the token you want to trade, and tap on 'Buy' or 'Sell'. Enter the amount, review the transaction details, and confirm."
  },
  {
    id: "5",
    question: "How do I stake my tokens?",
    answer: "To stake tokens, go to the Tokens tab, select the token you want to stake, and tap on 'Stake'. Choose the staking option that suits your needs, enter the amount you want to stake, and confirm the transaction."
  },
  {
    id: "6",
    question: "How do I change my password?",
    answer: "To change your password, go to the Profile tab, tap on 'Security', then 'Change Password'. Enter your current password, your new password, confirm the new password, and tap 'Save'."
  },
  {
    id: "7",
    question: "What should I do if I forget my password?",
    answer: "If you forget your password, tap on 'Forgot Password' on the login screen. Enter the email address associated with your account, and we'll send you instructions to reset your password."
  },
  {
    id: "8",
    question: "How do I enable two-factor authentication?",
    answer: "To enable two-factor authentication, go to the Profile tab, tap on 'Security', then toggle on 'Two-Factor Authentication'. Follow the on-screen instructions to complete the setup."
  }
];

export default function HelpScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage("");
      
      // Show success message
      Alert.alert(
        "Message Sent",
        "We've received your message and will get back to you soon.",
        [{ text: "OK" }]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help you?</Text>
          <Text style={styles.sectionDescription}>
            Find answers or contact our support team
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search for help"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          
          {filteredFaqs.length === 0 ? (
            <Text style={styles.noResults}>No results found for "{searchQuery}"</Text>
          ) : (
            filteredFaqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <View style={styles.faqQuestionContent}>
                    <View style={styles.faqIcon}>
                      <HelpCircle size={16} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  </View>
                  {expandedFaq === faq.id ? (
                    <ChevronUp size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
                
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push("/faq")}
          >
            <Text style={styles.viewAllText}>View All FAQs</Text>
            <ExternalLink size={16} color={theme.colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Contact Support</Text>
          
          <View style={styles.contactOption}>
            <View style={styles.contactIcon}>
              <MessageSquare size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Chat with Us</Text>
              <Text style={styles.contactDescription}>
                Start a conversation with our support team
              </Text>
              <Button
                title="Start Chat"
                onPress={() => router.push("/support-chat")}
                variant="outline"
                size="small"
                style={styles.contactButton}
              />
            </View>
          </View>
          
          <View style={styles.contactOption}>
            <View style={styles.contactIcon}>
              <Phone size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactDescription}>
                Available Monday-Friday, 9am-5pm
              </Text>
              <Button
                title="Call Support"
                onPress={() => Alert.alert("Call Support", "Would you like to call customer support?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Call", onPress: () => console.log("Call support") }
                ])}
                variant="outline"
                size="small"
                style={styles.contactButton}
              />
            </View>
          </View>
          
          <View style={styles.contactOption}>
            <View style={styles.contactIcon}>
              <Mail size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Us</Text>
              <Text style={styles.contactDescription}>
                Send us a message and we'll get back to you
              </Text>
              
              <View style={styles.messageContainer}>
                <RNTextInput
                  style={styles.messageInput}
                  placeholder="Type your message here..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <Button
                title="Send Message"
                onPress={handleSendMessage}
                variant="primary"
                size="small"
                loading={isLoading}
                style={styles.sendButton}
              />
            </View>
          </View>
        </Card>
      </ScrollView>
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
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.body,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  faqQuestionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  faqIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  faqQuestionText: {
    ...theme.typography.body,
    fontWeight: "500",
    flex: 1,
  },
  faqAnswer: {
    paddingBottom: theme.spacing.md,
    paddingLeft: 36,
  },
  faqAnswerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  noResults: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  viewAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  contactOption: {
    flexDirection: "row",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 227, 168, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  contactDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  contactButton: {
    alignSelf: "flex-start",
  },
  messageContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  messageInput: {
    padding: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body,
    height: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    alignSelf: "flex-end",
    marginTop: theme.spacing.sm,
  },
});