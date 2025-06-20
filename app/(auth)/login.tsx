import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'caretaker'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      // Navigation will be handled by the RootLayout
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.title}>FallGuard</Text>
            <Text style={styles.subtitle}>Your Safety Companion</Text>
          </View>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'patient' && styles.selectedUserType]}
              onPress={() => setUserType('patient')}
              disabled={isLoading}
            >
              <Text style={[styles.userTypeText, userType === 'patient' && styles.selectedUserTypeText]}>
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'caretaker' && styles.selectedUserType]}
              onPress={() => setUserType('caretaker')}
              disabled={isLoading}
            >
              <Text style={[styles.userTypeText, userType === 'caretaker' && styles.selectedUserTypeText]}>
                Caretaker
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor="#999"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                placeholderTextColor="#999"
              />
              <View style={styles.eyeIconContainer}>
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPressIn={() => setShowPassword(true)}
                  onPressOut={() => setShowPassword(false)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupLink}
              onPress={() => router.push('/(auth)/signup' as any)}
              disabled={isLoading}
            >
              <Text style={styles.signupLinkText}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  userTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  selectedUserType: {
    backgroundColor: '#2E7D32',
  },
  userTypeText: {
    color: '#2E7D32',
    fontSize: 16,
  },
  selectedUserTypeText: {
    color: '#fff',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupLinkText: {
    color: '#2E7D32',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
    height: 50,
  },
  passwordInput: {
    paddingRight: 50,
    height: 50,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 