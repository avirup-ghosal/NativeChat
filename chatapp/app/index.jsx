import { Link } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, LinearGradient } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  return (
    <View style={styles.container}>
      {/* Background Gradient Effect */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      
      <View style={styles.content}>
        {/* App Icon/Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="chatbubbles" size={40} color="#ffffff" />
          </View>
        </View>

        {/* Welcome Text */}
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>ChatApp</Text>
        <Text style={styles.subtitle}>
          Connect with friends and start meaningful conversations
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/register" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </Link>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Secure & Private</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flash" size={20} color="#f39c12" />
            <Text style={styles.featureText}>Lightning Fast</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people" size={20} color="#3498db" />
            <Text style={styles.featureText}>Group Chats</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#3498db',
    opacity: 0.1,
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#27ae60',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  logoContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    color: '#7f8c8d',
    marginBottom: 5,
    fontWeight: '300',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});