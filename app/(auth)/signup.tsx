import React, { useState, useEffect } from 'react';
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
  StatusBar,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { hapticFeedback } from '../../lib/haptics';

const generateRandomCode = (length = 6) => {
  return Math.random().toString(36).substring(2, length + 2).toUpperCase();
};

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'patient' | 'caretaker'>('patient');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userType === 'caretaker') {
      setReferralCode(generateRandomCode());
    } else {
      setReferralCode('');
    }
  }, [userType]);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      hapticFeedback.error();
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      hapticFeedback.formSubmit();
      await signUp(email, password, fullName, userType);
      hapticFeedback.success();
    } catch (err: any) {
      hapticFeedback.error();
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
            <View style={styles.logoCropContainer}>
              <Image
                source={require('../../assets/images/fallguard-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'patient' && styles.selectedUserType]}
              onPress={() => {
                hapticFeedback.toggle();
                setUserType('patient');
              }}
              disabled={isLoading}
            >
              <Text style={[styles.userTypeText, userType === 'patient' && styles.selectedUserTypeText]}>
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'caretaker' && styles.selectedUserType]}
              onPress={() => {
                hapticFeedback.toggle();
                setUserType('caretaker');
              }}
              disabled={isLoading}
            >
              <Text style={[styles.userTypeText, userType === 'caretaker' && styles.selectedUserTypeText]}>
                Caregiver
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            editable={!isLoading}
            placeholderTextColor="#999"
          />
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
              textContentType="none"
              autoComplete="off"
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
              textContentType="none"
              autoComplete="off"
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
          {userType === 'patient' && (
            <TextInput
              style={styles.input}
              placeholder="Referral Code (Optional)"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          )}
          {userType === 'caretaker' && (
            <View>
              <Text style={styles.label}>Your Referral Code</Text>
              <TextInput
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                editable={!isLoading}
                placeholderTextColor="#999"
              />
            </View>
          )}
          <TouchableOpacity 
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={() => {
              hapticFeedback.buttonPress();
              handleSignUp();
            }}
            disabled={isLoading}
          >
            <Text style={styles.signupButtonText}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => {
              hapticFeedback.buttonPress();
              router.back();
            }}
            disabled={isLoading}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
    backgroundColor: 'transparent',
  },
  logoCropContainer: {
    width: 420,
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 420,
    height: 180,
    marginTop: -10,
    alignSelf: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 12,
  },
  userTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  selectedUserType: {
    backgroundColor: '#2E7D32',
  },
  userTypeText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  selectedUserTypeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderRadius: 0,
    marginBottom: 18,
    fontSize: 16,
    color: '#222',
    borderBottomWidth: 1.2,
    borderBottomColor: '#bdbdbd',
    width: 320,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 18,
    height: 56,
    width: 320,
  },
  passwordInput: {
    paddingRight: 50,
    height: 56,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 0,
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
  signupButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: 320,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  loginLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.85,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
}); 