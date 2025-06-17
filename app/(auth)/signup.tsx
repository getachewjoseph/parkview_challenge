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

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'caretaker'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.register({ email, password, userType });
      if (data.userType === 'patient') {
        router.replace('/(tabs)/patient-info');
      } else {
        router.replace('/(tabs)/caretaker-dashboard');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to sign up');
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
            <Text style={styles.subtitle}>Create Your Account</Text>
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                placeholderTextColor="#999"
              />
              <View style={styles.eyeIconContainer}>
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPressIn={() => setShowConfirmPassword(true)}
                  onPressOut={() => setShowConfirmPassword(false)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? Sign In
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
  signupButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
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