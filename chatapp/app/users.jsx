

import { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Backend running on localhost
  const API_BASE_URL = 'http://localhost:5000'; // Android Emulator
  // const API_BASE_URL = 'http://localhost:3000/api'; // iOS Simulator
  // const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api'; // Physical device

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please login again.');
        router.replace('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.multiRemove(['userToken', 'userData']);
                router.replace('/login');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error', 
          'Failed to load users. Please check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userToken', 'userData']);
              router.replace('/');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const getInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRandomColor = (email) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
    const index = email.length % colors.length;
    return colors[index];
  };

  const renderUserItem = ({ item }) => {
    const isCurrentUser = currentUser && item._id === currentUser._id;
    
    if (isCurrentUser) return null; // Don't show current user in the list

    return (
      <TouchableOpacity
        style={styles.userItem}
        // Corrected line: pass both the conversationId and the name
        onPress={() => router.push({ pathname: "/chat", params: { conversationId: item._id, name: item.name } })}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: getRandomColor(item.email) }]}>
          <Text style={styles.avatarText}>{getInitials(item.email)}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        
        <View style={styles.chatIcon}>
          <Ionicons name="chatbubble-outline" size={20} color="#7f8c8d" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>No Users Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no other users to chat with at the moment.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  const filteredUsers = users.filter(user => 
    currentUser ? user._id !== currentUser._id : true
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Chats</Text>
          <Text style={styles.headerSubtitle}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      {/* Current User Card */}
      {currentUser && (
        <View style={styles.currentUserCard}>
          <View style={[styles.currentUserAvatar, { backgroundColor: getRandomColor(currentUser.email) }]}>
            <Text style={styles.currentUserAvatarText}>{getInitials(currentUser.email)}</Text>
          </View>
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserName}>{currentUser.name}</Text>
            <Text style={styles.currentUserEmail}>You</Text>
          </View>
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  currentUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  currentUserAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  currentUserEmail: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginTop: 2,
  },
  listContainer: {
    padding: 20,
    paddingTop: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  chatIcon: {
    padding: 5,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});