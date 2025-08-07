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
  StatusBar,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { hapticFeedback } from '../../lib/haptics';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'caretaker'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const handleLogin = async () => {
    if (!email || !password) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      hapticFeedback.formSubmit();
      await signIn(email, password);
      hapticFeedback.success();
      // Navigation will be handled by the RootLayout
    } catch (err: any) {
      hapticFeedback.error();
      Alert.alert('Error', err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

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
                    <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={() => {
              hapticFeedback.buttonPress();
              handleLogin();
            }}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => {
              hapticFeedback.buttonPress();
              router.push('/(auth)/signup' as any);
            }}
            disabled={isLoading}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account? Sign up
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
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    letterSpacing: 0.5,
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
  loginButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: 320,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  signupLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  signupLinkText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.85,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
}); 