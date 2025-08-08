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
import { theme } from '@/constants/theme';

// --- DATA STRUCTURES ---
interface SuggestedAction {
  title: string;
  query: string;
}

interface ActionToConfirm {
  action: string;
  payload: any;
}

interface ActionConfirmation {
  message: string;
  actionToConfirm: ActionToConfirm;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  suggestedActions?: SuggestedAction[];
  confirmation?: ActionConfirmation;
}

const persistentActions: SuggestedAction[] = [
  { title: 'Pay a Bill', query: 'What are my upcoming bills?' },
  { title: 'Send Money', query: 'I want to send money' },
  { title: 'Set a Budget', query: 'Set my shopping budget to $250' },
];

const LinaAI: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi! I\'m Lina, your AI financial assistant. How can I help you?', sender: 'ai' },
  ]);
  
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionToConfirm, setActionToConfirm] = useState<ActionToConfirm | null>(null);

  // Generate a unique, persistent session ID for this chat instance.
  const [sessionId] = useState(() => Date.now().toString() + Math.random().toString(36).substr(2, 9));

  // Use individual selectors for each piece of state and action for performance.
  const balance = useWalletStore((state) => state.balance);
  const transactions = useWalletStore((state) => state.transactions);
  const budgetCategories = useWalletStore((state) => state.budgetCategories);
  const bills = useWalletStore((state) => state.bills);
  const contacts = useWalletStore((state) => state.contacts);
  const payBill = useWalletStore((state) => state.payBill);
  const sendMoney = useWalletStore((state) => state.sendMoney);
  const depositMoney = useWalletStore((state) => state.depositMoney);
  const setBudgetLimit = useWalletStore((state) => state.setBudgetLimit);
  const addBudgetCategory = useWalletStore((state) => state.addBudgetCategory);
  const toggleAutoPay = useWalletStore((state) => state.toggleAutoPay);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || inputText.trim();
    if (query === '' || isLoading) return;

    setMessages(prev => prev.map(msg => ({ ...msg, suggestedActions: [], confirmation: undefined })));
    
    // --- CONFIRMATION LOGIC ---
    if (query === 'user_confirm_action') {
        setIsLoading(true);
        if (actionToConfirm) {
            let confirmationText = "Action confirmed!";
            if (actionToConfirm.action === 'payBill') {
                const { billId, amount, category } = actionToConfirm.payload;
                payBill(billId, amount, category);
                confirmationText = "Done! 💸 Your bill has been paid.";
            } else if (actionToConfirm.action === 'sendMoney') {
                const { recipient, amount } = actionToConfirm.payload;
                sendMoney(recipient, amount);
                confirmationText = `Sent $${amount.toFixed(2)} to ${recipient}! 🚀`;
            } else if (actionToConfirm.action === 'addMoney') {
                const { amount } = actionToConfirm.payload;
                depositMoney(amount, "Added via Lina AI");
                confirmationText = `Added $${amount.toFixed(2)} to your balance! 🤑`;
            } else if (actionToConfirm.action === 'setBudgetLimit') {
                const { categoryId, limit } = actionToConfirm.payload;
                setBudgetLimit(categoryId, limit);
                confirmationText = `Got it! I've updated your budget limit. ✅`;
            } else if (actionToConfirm.action === 'addBudgetCategory') {
                addBudgetCategory({ name: actionToConfirm.payload.name, limit: actionToConfirm.payload.limit, color: theme.colors.primary, icon: "HelpCircle" });
                confirmationText = `Perfect! I've created a new budget for ${actionToConfirm.payload.name}.`;
            } else if (actionToConfirm.action === 'toggleAutoPay') {
                const { billId } = actionToConfirm.payload;
                toggleAutoPay(billId);
                confirmationText = `Okay, I've updated the autopay settings for that bill. 👍`;
            }
            setMessages(prev => [...prev, {id: Date.now().toString(), text: confirmationText, sender: 'ai'}]);
        }
        setActionToConfirm(null);
        setIsLoading(false);
        return; 
    }
    if (query === 'user_cancel_action') {
        setMessages(prev => [...prev, {id: Date.now().toString(), text: "Okay, cancelled.", sender: 'ai'}]);
        setActionToConfirm(null);
        return;
    }
    // --- END CONFIRMATION LOGIC ---

    const userMessage: Message = { id: Date.now().toString(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    if (!customQuery) setInputText('');
    setIsLoading(true);

    try {
      const userContext = {
        balance,
        recent_transactions: transactions.slice(0, 10),
        budgets: budgetCategories,
        unpaid_bills: bills.filter(b => !b.isPaid),
        paid_bills: bills.filter(b => b.isPaid),
        contacts,
      };

      // Pass the sessionId with every request
      const response = await aiService.processQuery(query, userContext, sessionId);
      
      let aiResponseText = 'I seem to be having a little trouble.';
      let actions: SuggestedAction[] = [];
      let confirmation: ActionConfirmation | undefined = undefined;

      if (response.success) {
        try {
          const responseData = JSON.parse(response.response);
          if (responseData && responseData.action === 'confirmationRequest') {
            setActionToConfirm(responseData.confirmation.actionToConfirm);
            confirmation = responseData.confirmation;
            aiResponseText = responseData.confirmation_message;
          } else {
            aiResponseText = response.response;
          }
        } catch {
          aiResponseText = response.response;
        }
      }
      
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai', confirmation, suggestedActions: actions };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI Service Error:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: 'Sorry, I couldn\'t connect.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';
    const isLastMessage = index === messages.length - 1;

    return (
      <View key={`${message.id}-${index}`} style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{message.text}</Text>
        </View>
        
        {isLastMessage && message.confirmation ? (
            <View style={styles.confirmationContainer}>
                <Text style={styles.confirmationText}>{message.confirmation.message}</Text>
                <View style={styles.confirmationButtonRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleSendMessage('user_cancel_action')}
                    >
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        onPress={() => handleSendMessage('user_confirm_action')}
                    >
                        <Text style={[styles.actionButtonText, styles.confirmButtonText]}>Yes, Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : isLastMessage && message.suggestedActions && message.suggestedActions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.suggestedActions.map((action, actionIndex) => (
              <TouchableOpacity key={actionIndex} style={styles.actionButton} onPress={() => handleSendMessage(action.query)}>
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
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Lina is typing...</Text>
          </View>
        )}
      </ScrollView>

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
        <TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} placeholder="Ask Lina about your finances..." placeholderTextColor={theme.colors.placeholder} multiline maxLength={500} editable={!isLoading} />
        <TouchableOpacity style={[styles.sendButton, (isLoading || inputText.trim() === '') && styles.sendButtonDisabled]} onPress={() => handleSendMessage()} disabled={isLoading || inputText.trim() === ''}>
          <Text style={[styles.sendButtonText, (isLoading || inputText.trim() === '') && styles.sendButtonTextDisabled]}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  chatArea: { 
    flex: 1 
  },
  chatContent: { 
    padding: theme.spacing.md, 
    paddingBottom: theme.spacing.lg 
  },
  messageContainer: { 
    marginBottom: theme.spacing.md 
  },
  userMessageContainer: { 
    alignItems: 'flex-end' 
  },
  aiMessageContainer: { 
    alignItems: 'flex-start' 
  },
  messageBubble: { 
    maxWidth: '80%', 
    borderRadius: theme.borderRadius.lg, 
    padding: theme.spacing.md,
    ...theme.shadows.small
  },
  userBubble: { 
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(74, 227, 168, 0.3)'
  },
  aiBubble: { 
    backgroundColor: theme.colors.card, 
    borderWidth: 1, 
    borderColor: theme.colors.border 
  },
  messageText: { 
    fontSize: 16, 
    lineHeight: 22 
  },
  userText: { 
    color: '#121212',
    fontWeight: '500'
  },
  aiText: { 
    color: theme.colors.text 
  },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: theme.spacing.sm, 
    marginLeft: theme.spacing.md 
  },
  loadingText: { 
    marginLeft: theme.spacing.sm, 
    fontSize: 14, 
    color: theme.colors.textSecondary, 
    fontStyle: 'italic' 
  },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    backgroundColor: theme.colors.card, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border, 
    padding: theme.spacing.md, 
    paddingTop: theme.spacing.md, 
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.md 
  },
  textInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    borderRadius: theme.borderRadius.lg, 
    paddingHorizontal: theme.spacing.md, 
    paddingVertical: theme.spacing.md, 
    fontSize: 16, 
    maxHeight: 100, 
    marginRight: theme.spacing.md, 
    backgroundColor: theme.colors.surfaceMid,
    color: theme.colors.text
  },
  sendButton: { 
    backgroundColor: theme.colors.primary, 
    borderRadius: theme.borderRadius.lg, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...theme.shadows.small
  },
  sendButtonDisabled: { 
    backgroundColor: theme.colors.surfaceHigh,
    opacity: 0.5
  },
  sendButtonText: { 
    color: '#121212', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  sendButtonTextDisabled: { 
    color: theme.colors.textSecondary 
  },
  actionsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: theme.spacing.sm, 
    justifyContent: 'flex-start', 
    marginLeft: theme.spacing.sm 
  },
  actionButton: { 
    borderRadius: theme.borderRadius.md, 
    paddingVertical: theme.spacing.sm, 
    paddingHorizontal: theme.spacing.md, 
    marginRight: theme.spacing.sm, 
    marginBottom: theme.spacing.sm, 
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(74, 227, 168, 0.1)'
  },
  actionButtonText: { 
    fontWeight: '600', 
    fontSize: 14,
    color: theme.colors.primary
  },
  confirmationContainer: { 
    marginTop: theme.spacing.sm, 
    marginLeft: theme.spacing.sm, 
    padding: theme.spacing.md, 
    backgroundColor: theme.colors.surfaceMid, 
    borderRadius: theme.borderRadius.md, 
    width: '80%',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  confirmationText: { 
    fontSize: 15, 
    color: theme.colors.text, 
    marginBottom: theme.spacing.md, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  confirmationButtonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  confirmButton: { 
    backgroundColor: theme.colors.success, 
    borderColor: 'rgba(74, 227, 168, 0.3)' 
  },
  confirmButtonText: { 
    color: '#121212',
    fontWeight: '600'
  },
  cancelButton: { 
    backgroundColor: theme.colors.surfaceHigh, 
    borderColor: theme.colors.border 
  },
  cancelButtonText: { 
    color: theme.colors.text 
  },
  persistentActionsContainer: { 
    paddingVertical: theme.spacing.sm, 
    backgroundColor: theme.colors.card, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border 
  },
  persistentActionButton: { 
    backgroundColor: theme.colors.surfaceMid, 
    borderRadius: theme.borderRadius.lg, 
    paddingVertical: theme.spacing.sm, 
    paddingHorizontal: theme.spacing.md, 
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  persistentActionButtonText: { 
    color: theme.colors.text, 
    fontWeight: '500', 
    fontSize: 14 
  },
});

export default LinaAI;