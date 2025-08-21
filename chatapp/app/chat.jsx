


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';

const ChatPage = () => {
  const { conversationId, name } = useLocalSearchParams(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const API_BASE_URL = 'http://localhost:5000'; 

  useEffect(() => {
    let newSocket;

    const setupChat = async () => {
      try {
        setLoading(true);

        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          Alert.alert('Error', 'User not authenticated. Please log in again.');
          router.replace('/login');
          return;
        }
        const user = JSON.parse(userData);
        setCurrentUser(user);

        const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/messages`);
        setMessages(response.data);

        newSocket = io(API_BASE_URL, {
          transports: ['websocket'],
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('Socket.IO connection established');
          newSocket.emit('user:online', user._id);
          setLoading(false);
        });

        newSocket.on('message:new', (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on('typing:start', (data) => {
          if (data.sender === conversationId) {
            setIsTyping(true);
          }
        });

        newSocket.on('typing:stop', (data) => {
          if (data.sender === conversationId) {
            setIsTyping(false);
          }
        });

        newSocket.on('message:read', (message) => {
          console.log('Message marked as read:', message);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket.IO connection disconnected');
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket.IO connection error:', err.message);
          setLoading(false);
        });

      } catch (e) {
        console.error('Chat setup failed:', e);
        Alert.alert('Error', 'Failed to load chat history or connect to server.');
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [conversationId, name]); 

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !socket || socket.connected === false) {
      return;
    }

    socket.emit('message:send', {
      sender: currentUser._id,
      receiver: conversationId,
      content: newMessage.trim(),
    });

    const tempMessage = {
      sender: currentUser._id,
      receiver: conversationId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      _id: Math.random().toString(),
    };
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    
    setNewMessage('');
    socket.emit('typing:stop', { sender: currentUser._id, receiver: conversationId });
  };
  
  const handleTyping = (text) => {
      setNewMessage(text);
      if (text.length > 0 && !isTyping) {
          socket.emit('typing:start', { sender: currentUser._id, receiver: conversationId });
      } else if (text.length === 0) {
          socket.emit('typing:stop', { sender: currentUser._id, receiver: conversationId });
      }
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.sender === currentUser?._id;
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
          inverted={true}
        />
        
        {isTyping && <Text style={styles.typingIndicator}>Typing...</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={handleTyping}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || !socket || !socket.connected}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    maxWidth: '80%',
    flexDirection: 'column',
  },
  myMessage: {
    backgroundColor: '#3498db',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    backgroundColor: '#bdc3c7',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  myMessageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  otherMessageText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.4)',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  typingIndicator: {
      alignSelf: 'flex-start',
      fontSize: 14,
      color: '#7f8c8d',
      paddingHorizontal: 20,
      marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 25,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ChatPage;
