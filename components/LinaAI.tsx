import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useWalletStore } from '@/store/walletStore';
import aiService from '@/services/aiService';

// --- DATA STRUCTURES ---
interface SuggestedAction {
  title: string;
  query: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  suggestedActions?: SuggestedAction[];
}

// --- PERSISTENT QUICK ACTIONS ---
const persistentActions: SuggestedAction[] = [
  { title: 'Pay a Bill', query: 'What are my upcoming bills?' },
  { title: 'My Last Transaction', query: 'What was my last transaction?' },
  { title: 'Summarize Spending', query: 'Summarize my recent spending' },
];

const LinaAI: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi! I\'m Lina, your AI financial assistant. How can I help you manage your finances today?', sender: 'ai' },
  ]);
  
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use individual selectors for each piece of state for performance.
  const balance = useWalletStore((state) => state.balance);
  const transactions = useWalletStore((state) => state.transactions);
  const budgetCategories = useWalletStore((state) => state.budgetCategories);
  const bills = useWalletStore((state) => state.bills);
  const payBill = useWalletStore((state) => state.payBill);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || inputText.trim();
    if (query === '' || isLoading) return;

    // Clear previous suggestions when a new message is sent
    setMessages(prev => prev.map(msg => ({ ...msg, suggestedActions: [] })));

    const userMessage: Message = { id: Date.now().toString(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    if (!customQuery) {
        setInputText('');
    }
    setIsLoading(true);

    try {
      const userContext = {
        balance,
        recent_transactions: transactions.slice(0, 15),
        budgets: budgetCategories,
        unpaid_bills: bills.filter(b => !b.isPaid),
      };

      const response = await aiService.processQuery(query, userContext);
      
      let aiResponseText = 'I seem to be having a little trouble. Could you ask me that again?';
      let actions: SuggestedAction[] = [];

      if (response.success) {
        try {
          // Attempt to parse the response as JSON to check for actions
          const responseData = JSON.parse(response.response);

          // If it's a JSON object AND has an "action" key, handle it.
          if (responseData && responseData.action) {
            
            if (responseData.action === 'payBill') {
              const { billId, amount, category } = responseData.payload;
              // Call the actual Zustand function to update the app state
              payBill(billId, amount, category); 
              aiResponseText = responseData.confirmation_message;
            } 
            // Add a handler for the new 'payAllBills' action
            else if (responseData.action === 'payAllBills') {
              const { billIds } = responseData.payload;
              const unpaidBillsToPay = bills.filter(b => billIds.includes(b.id));
              
              unpaidBillsToPay.forEach(bill => {
                payBill(bill.id, bill.amount, bill.category);
              });
              
              aiResponseText = responseData.confirmation_message;
            }
            // Add other `else if` blocks for future actions here (e.g., sendMoney)

          } else if (responseData && responseData.responseText) {
            // Handle responses that include quick suggestions
            aiResponseText = responseData.responseText;
            actions = responseData.suggestedActions || [];
          } else {
            // Fallback for unexpected JSON structure
            aiResponseText = response.response;
          }
        } catch (e) {
          // If parsing fails, it's a regular text response
          aiResponseText = response.response;
        }
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        suggestedActions: actions,
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI Service Error:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: 'Sorry, I couldn\'t connect to the AI service.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';
    const isLastMessage = index === messages.length - 1;

    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{message.text}</Text>
        </View>
        {isLastMessage && message.suggestedActions && message.suggestedActions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.suggestedActions.map((action, actionIndex) => (
              <TouchableOpacity
                key={actionIndex}
                style={styles.actionButton}
                onPress={() => handleSendMessage(action.query)}
              >
                <Text style={styles.actionButtonText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView ref={scrollViewRef} style={styles.chatArea} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
        {messages.map((msg, index) => renderMessage(msg, index))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Lina is typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Persistent Quick Actions Bar */}
      <View style={styles.persistentActionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {persistentActions.map((action, index) => (
                <TouchableOpacity key={index} style={styles.persistentActionButton} onPress={() => handleSendMessage(action.query)}>
                    <Text style={styles.persistentActionButtonText}>{action.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <View style={styles.inputBar}>
        <TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} placeholder="Ask Lina about your finances..." placeholderTextColor="#999" multiline maxLength={500} editable={!isLoading} />
        <TouchableOpacity style={[styles.sendButton, (isLoading || inputText.trim() === '') && styles.sendButtonDisabled]} onPress={() => handleSendMessage()} disabled={isLoading || inputText.trim() === ''}>
          <Text style={[styles.sendButtonText, (isLoading || inputText.trim() === '') && styles.sendButtonTextDisabled]}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 20 },
  messageContainer: { marginBottom: 12 },
  userMessageContainer: { alignItems: 'flex-end' },
  aiMessageContainer: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: '#007AFF' },
  aiBubble: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0' },
  messageText: { fontSize: 16, lineHeight: 20 },
  userText: { color: 'white' },
  aiText: { color: '#333' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 16 },
  loadingText: { marginLeft: 8, fontSize: 14, color: '#666', fontStyle: 'italic' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 16 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, maxHeight: 100, marginRight: 12, backgroundColor: '#f9f9f9' },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#ccc' },
  sendButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  sendButtonTextDisabled: { color: '#999' },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'flex-start', marginLeft: 10 },
  actionButton: { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  actionButtonText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  persistentActionsContainer: {
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  persistentActionButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  persistentActionButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default LinaAI;