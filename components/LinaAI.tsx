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
// --- CORRECTED UUID IMPORTS ---
// This import must come first to polyfill crypto requirements.
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

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

// Clean typing indicator
const TypingIndicator: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.aiAvatar}>
        <Text style={styles.avatarText}>L</Text>
      </View>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>Lina is typing{dots}</Text>
      </View>
    </View>
  );
};

const LinaAI: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi! I\'m Lina, your AI financial assistant. How can I help you manage your finances today?', sender: 'ai' },
  ]);
  
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionToConfirm, setActionToConfirm] = useState<ActionToConfirm | null>(null);

  // Generate a unique, persistent session ID for this chat instance.
  const [sessionId] = useState(uuidv4());

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
        } catch (e) {
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
      <View key={`${message.id}-${index}`} style={styles.messageWrapper}>
        {/* Message with avatar */}
        <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
          {/* AI Avatar */}
          {!isUser && (
            <View style={styles.aiAvatar}>
              <Text style={styles.avatarText}>L</Text>
            </View>
          )}
          
          {/* Message bubble */}
          <View style={[styles.messageContainer, isUser ? styles.userContainer : styles.aiContainer]}>
            <Text style={[styles.senderLabel, isUser ? styles.userLabel : styles.aiLabel]}>
              {isUser ? 'You' : 'Lina'}
            </Text>
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                {message.text}
              </Text>
            </View>
          </View>
          
          {/* User spacer */}
          {isUser && <View style={styles.userSpacer} />}
        </View>
        
        {/* Confirmation UI */}
        {isLastMessage && message.confirmation && (
          <View style={styles.confirmationWrapper}>
            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationMessage}>{message.confirmation.message}</Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.cancelButton]}
                  onPress={() => handleSendMessage('user_cancel_action')}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.confirmButton]}
                  onPress={() => handleSendMessage('user_confirm_action')}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Suggested actions */}
        {isLastMessage && message.suggestedActions && message.suggestedActions.length > 0 && (
          <View style={styles.actionsWrapper}>
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat area */}
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent} 
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
        {isLoading && <TypingIndicator />}
      </ScrollView>

      {/* Quick actions */}
      <View style={styles.quickActionsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.quickActionsContent}
        >
          {persistentActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickActionButton} 
              onPress={() => handleSendMessage(action.query)}
            >
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input bar */}
      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <TextInput 
            style={styles.textInput} 
            value={inputText} 
            onChangeText={setInputText} 
            placeholder="Ask Lina anything about your finances..." 
            placeholderTextColor={theme.colors.placeholder} 
            multiline 
            maxLength={500} 
            editable={!isLoading} 
          />
          <TouchableOpacity 
            style={[styles.sendButton, (isLoading || inputText.trim() === '') && styles.sendButtonDisabled]} 
            onPress={() => handleSendMessage()} 
            disabled={isLoading || inputText.trim() === ''}
          >
            <Text style={[styles.sendButtonText, (isLoading || inputText.trim() === '') && styles.sendButtonTextDisabled]}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  
  // Message Layout
  messageWrapper: {
    marginBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  messageContainer: {
    flex: 1,
    maxWidth: '75%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  userSpacer: {
    width: 48,
  },
  
  // Avatar
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Message Labels & Bubbles
  senderLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  userLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  aiLabel: {
    color: theme.colors.primary,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#121212',
    fontWeight: '500',
  },
  aiText: {
    color: theme.colors.text,
  },
  
  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  typingBubble: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 12,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Confirmation
  confirmationWrapper: {
    paddingLeft: 48,
    marginTop: 12,
  },
  confirmationCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmationMessage: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
  },
  confirmText: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Actions
  actionsWrapper: {
    paddingLeft: 48,
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(74, 227, 168, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 227, 168, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Quick Actions
  quickActionsContainer: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: theme.colors.surfaceMid,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickActionText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Input Section
  inputSection: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surfaceMid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surfaceHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '700',
  },
  sendButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
});

export default LinaAI;