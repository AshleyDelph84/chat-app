import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const { colors, toggleTheme, isThemeLoading, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const BASE_HEADER_HEIGHT = 50;
  const HEADER_HEIGHT = BASE_HEADER_HEIGHT + insets.top;

  const n8nWebhookUrl = 'https://n8n.ash-does-tech.co.uk/webhook-test/95764c8b-cdf0-4ed3-999d-f4c1e5c1ed94';

  const createChatStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top,
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder,
      backgroundColor: colors.headerBackground,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.headerText,
    },
    headerButton: {
      padding: 5,
    },
    headerButtonText: {
      color: colors.primary,
      fontSize: 16,
    },
    messageList: {
      flex: 1,
      paddingHorizontal: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
      backgroundColor: colors.inputBackground,
      color: colors.inputText,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 10,
      borderRadius: 15,
      marginBottom: 10,
    },
    userMessage: {
      backgroundColor: colors.bubbleUser,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 5,
    },
    botMessage: {
      backgroundColor: colors.bubbleBot,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 5,
    },
    userMessageText: {
      fontSize: 16,
      color: colors.textUser,
    },
    botMessageText: {
      fontSize: 16,
      color: colors.textBot,
    },
    typingIndicator: {
      paddingHorizontal: 15,
      paddingVertical: 5,
      fontStyle: 'italic',
      color: colors.subtleText,
    },
    themeToggleButton: {
      padding: 8,
      marginRight: 8,
    },
    themeToggleButtonText: {
      fontSize: 20,
    }
  });

  const styles = createChatStyles(colors);

  const handleSend = useCallback(async () => {
    const userMessageText = inputText.trim();
    if (!userMessageText) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
    };

    setMessages(prevMessages => [newMessage, ...prevMessages]);
    setInputText('');
    setIsBotTyping(true);

    try {
      const response = await axios.post(n8nWebhookUrl, {
        message: userMessageText,
      });

      const responseData = response.data;
      console.log('Received webhook response data structure:', JSON.stringify(responseData, null, 2));

      setIsBotTyping(false); // Stop typing indicator

      let botText = "Sorry, I couldn't process that."; // Default message
      if (typeof responseData === 'string') {
        botText = responseData; // Handle plain string response
      } else if (responseData && typeof responseData === 'object') {
        // Try common keys, prioritize 'output', then 'message', then 'text', then 'response'
        botText = responseData.output || responseData.message || responseData.text || responseData.response || botText;
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        text: botText,
        sender: 'bot',
      };

      setMessages(prevMessages => [botMessage, ...prevMessages]);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error sending message:', error.response?.status, error.response?.data);
      } else {
        console.error('Error sending message:', error);
      }
      Alert.alert('Error', 'Could not send message. Please try again.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Error connecting to the bot.',
        sender: 'bot',
      };
      setMessages(prevMessages => [errorMessage, ...prevMessages]);
    }
  }, [inputText, n8nWebhookUrl]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={item.sender === 'user' ? styles.userMessageText : styles.botMessageText}>{item.text}</Text>
    </View>
  );

  const handleNewChat = () => {
    setMessages([]); // Clear messages
    setInputText(''); // Clear input
    // TODO: Potentially save the old chat history or reset backend state if needed
    Alert.alert('New Chat', 'Previous messages cleared.');
  };

  const handleMenu = () => {
    Alert.alert('Menu', 'Chat history feature coming soon!');
    // TODO: Implement chat history dropdown/modal
  };

  if (isThemeLoading) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_HEIGHT + 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMenu} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>☰ Menu</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={handleNewChat} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>+ New Chat</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 10 }}
        inverted
      />
      {isBotTyping && <Text style={styles.typingIndicator}>Agent is responding...</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={colors.subtleText}
          multiline
        />
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleButton}>
          <Text style={styles.themeToggleButtonText}>{theme === 'light' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
        <Button title="Send" onPress={handleSend} color={colors.primary} />
      </View>
    </KeyboardAvoidingView>
  );
}
