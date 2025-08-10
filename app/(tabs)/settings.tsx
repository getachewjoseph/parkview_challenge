import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  ScrollView,
  Switch,
  Modal
} from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTextSize } from '../../contexts/TextSizeContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../lib/haptics';
import { ScaledText } from '../../components/ScaledText';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'button' | 'input' | 'info' | 'slider';
  value?: any;
  onPress?: () => void;
  onValueChange?: ((value: boolean) => void) | ((value: number) => void);
  minValue?: number;
  maxValue?: number;
  step?: number;
}

export default function SettingsScreen() {
  const { user, logout, checkAuth } = useAuth();
  const { textSize, setTextSize, getScaledFontSize } = useTextSize();
  const [referralCode, setReferralCode] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [patientReferralCode, setPatientReferralCode] = useState('');
  const [loading, setLoading] = useState(user?.userType === 'caretaker');
  const [updating, setUpdating] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (user?.userType === 'caretaker') {
        try {
          const data = await api.getReferralCode();
          setReferralCode(data.referralCode);
          setNewReferralCode(data.referralCode);
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to fetch referral code');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchReferralCode();
  }, [user]);

  const handleUpdateReferralCode = async () => {
    try {
      setUpdating(true);
      hapticFeedback.formSubmit();
      const data = await api.updateReferralCode(newReferralCode);
      setReferralCode(data.referralCode);
      setNewReferralCode(data.referralCode);
      setShowReferralModal(false);
      hapticFeedback.success();
      Alert.alert('Success', 'Referral code updated successfully');
    } catch (error: any) {
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to update referral code');
    } finally {
      setUpdating(false);
    }
  };

  const handleLinkCaretaker = async () => {
    if (!patientReferralCode) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please enter a referral code.');
      return;
    }
    try {
      setUpdating(true);
      hapticFeedback.formSubmit();
      await api.linkCaretaker(patientReferralCode);
      await checkAuth();
      setShowLinkModal(false);
      hapticFeedback.success();
      Alert.alert('Success', 'You have been successfully linked to your caretaker.');
    } catch (error: any) {
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to link caretaker.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    hapticFeedback.buttonPress();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          hapticFeedback.critical();
          logout();
        }}
      ]
    );
  };

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingsItem}
        onPress={() => {
          if (item.onPress) {
            hapticFeedback.buttonPress();
            item.onPress();
          }
        }}
        disabled={item.type === 'info'}
      >
        <View style={styles.settingsItemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={20} color="#2E7D32" />
          </View>
          <View style={styles.settingsItemContent}>
            <ScaledText style={styles.settingsItemTitle} baseSize={16}>{item.title}</ScaledText>
            {item.subtitle && (
              <ScaledText style={styles.settingsItemSubtitle} baseSize={14}>{item.subtitle}</ScaledText>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={(value) => {
              hapticFeedback.toggle();
              if (item.onValueChange && typeof value === 'boolean') {
                (item.onValueChange as (value: boolean) => void)(value);
              }
            }}
            trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        )}
        
        {item.type === 'slider' && (
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={item.minValue || 0.5}
              maximumValue={item.maxValue || 2.0}
              step={item.step || 0.1}
              value={item.value}
              onValueChange={(value) => {
                hapticFeedback.toggle();
                if (item.onValueChange && typeof value === 'number') {
                  (item.onValueChange as (value: number) => void)(value);
                }
              }}
              minimumTrackTintColor="#2E7D32"
              maximumTrackTintColor="#e0e0e0"
            />
            <ScaledText style={styles.sliderValue} baseSize={14}>{Math.round(item.value * 100)}%</ScaledText>
          </View>
        )}
        
        {item.type === 'button' && (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
        
        {item.type === 'info' && (
          <Text style={styles.infoValue}>{item.value}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getSettingsItems = (): SettingsItem[] => {
    const items: SettingsItem[] = [
      {
        id: 'account',
        title: 'Account',
        subtitle: 'Manage your account settings',
        icon: 'person-outline',
        type: 'button',
        onPress: () => Alert.alert('Account', 'Account settings coming soon!')
      },
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Manage your notification preferences',
        icon: 'notifications-outline',
        type: 'toggle',
        value: notifications,
        onValueChange: setNotifications
      },
      {
        id: 'biometric',
        title: 'Biometric Authentication',
        subtitle: 'Use fingerprint or face ID to login',
        icon: 'finger-print-outline',
        type: 'toggle',
        value: biometricAuth,
        onValueChange: setBiometricAuth
      },
      {
        id: 'darkMode',
        title: 'Dark Mode',
        subtitle: 'Switch between light and dark themes',
        icon: 'moon-outline',
        type: 'toggle',
        value: darkMode,
        onValueChange: setDarkMode
      },
      {
        id: 'textSize',
        title: 'Text Size',
        subtitle: 'Adjust the size of text throughout the app',
        icon: 'text-outline',
        type: 'slider',
        value: textSize,
        onValueChange: setTextSize,
        minValue: 0.8,
        maxValue: 1.5,
        step: 0.1
      }
    ];

    if (user?.userType === 'caretaker') {
      items.push({
        id: 'referralCode',
        title: 'Referral Code',
        subtitle: referralCode,
        icon: 'qr-code-outline',
        type: 'button',
        onPress: () => setShowReferralModal(true)
      });
    } else if (user && !user.caretakerId) {
      items.push({
        id: 'linkCaretaker',
        title: 'Link to Caretaker',
        subtitle: 'Connect with your caretaker',
        icon: 'link-outline',
        type: 'button',
        onPress: () => setShowLinkModal(true)
      });
    }

    items.push(
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'Get help and contact support',
        icon: 'help-circle-outline',
        type: 'button',
        onPress: () => Alert.alert('Help', 'Help & support coming soon!')
      },
      {
        id: 'about',
        title: 'About',
        subtitle: 'App version and information',
        icon: 'information-circle-outline',
        type: 'button',
        onPress: () => Alert.alert('About', 'FallGuard v1.0.0\nYour Safety Companion')
      }
    );

    return items;
  };

  if (loading && user?.userType === 'caretaker') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <ScaledText style={styles.loadingText} baseSize={16}>Loading settings...</ScaledText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <ScaledText style={styles.headerTitle} baseSize={28}>Settings</ScaledText>
        <ScaledText style={styles.headerSubtitle} baseSize={16}>
          Manage your {user?.userType === 'caretaker' ? 'caretaker' : 'patient'} account
        </ScaledText>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons 
                name={user?.userType === 'caretaker' ? 'medical-outline' : 'person-outline'} 
                size={32} 
                color="#fff" 
              />
            </View>
            <View style={styles.profileInfo}>
              <ScaledText style={styles.profileName} baseSize={18}>{user?.email}</ScaledText>
              <ScaledText style={styles.profileRole} baseSize={14}>
                {user?.userType === 'caretaker' ? 'Caretaker' : 'Patient'}
              </ScaledText>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <ScaledText style={styles.sectionTitle} baseSize={20}>Preferences</ScaledText>
          <View style={styles.settingsCard}>
            {getSettingsItems().slice(0, 5).map(renderSettingsItem)}
          </View>
        </View>

        {user?.userType === 'caretaker' && (
          <View style={styles.section}>
            <ScaledText style={styles.sectionTitle} baseSize={20}>Caretaker Tools</ScaledText>
            <View style={styles.settingsCard}>
              {getSettingsItems().slice(5, 6).map(renderSettingsItem)}
            </View>
          </View>
        )}

        {user && !user.caretakerId && user.userType === 'patient' && (
          <View style={styles.section}>
            <ScaledText style={styles.sectionTitle} baseSize={20}>Connection</ScaledText>
            <View style={styles.settingsCard}>
              {getSettingsItems().slice(4, 5).map(renderSettingsItem)}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ScaledText style={styles.sectionTitle} baseSize={20}>Support</ScaledText>
          <View style={styles.settingsCard}>
            {getSettingsItems().slice(-2).map(renderSettingsItem)}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <ScaledText style={styles.logoutButtonText} baseSize={16}>Logout</ScaledText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Referral Code Modal */}
      <Modal
        visible={showReferralModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ScaledText style={styles.modalTitle} baseSize={20}>Update Referral Code</ScaledText>
              <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScaledText style={styles.modalLabel} baseSize={16}>Current Code</ScaledText>
            <ScaledText style={styles.currentCode} baseSize={24}>{referralCode}</ScaledText>
            
            <ScaledText style={styles.modalLabel} baseSize={16}>New Code</ScaledText>
            <TextInput
              style={styles.modalInput}
              value={newReferralCode}
              onChangeText={setNewReferralCode}
              autoCapitalize="characters"
              placeholder="Enter new referral code"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary} 
                onPress={() => setShowReferralModal(false)}
              >
                <ScaledText style={styles.modalButtonSecondaryText} baseSize={16}>Cancel</ScaledText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary} 
                onPress={handleUpdateReferralCode}
                disabled={updating}
              >
                <ScaledText style={styles.modalButtonPrimaryText} baseSize={16}>
                  {updating ? 'Updating...' : 'Update'}
                </ScaledText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Link Caretaker Modal */}
      <Modal
        visible={showLinkModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ScaledText style={styles.modalTitle} baseSize={20}>Link to Caretaker</ScaledText>
              <TouchableOpacity onPress={() => setShowLinkModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScaledText style={styles.modalLabel} baseSize={16}>Caretaker Referral Code</ScaledText>
            <TextInput
              style={styles.modalInput}
              value={patientReferralCode}
              onChangeText={setPatientReferralCode}
              autoCapitalize="characters"
              placeholder="Enter caretaker's referral code"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary} 
                onPress={() => setShowLinkModal(false)}
              >
                <ScaledText style={styles.modalButtonSecondaryText} baseSize={16}>Cancel</ScaledText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary} 
                onPress={handleLinkCaretaker}
                disabled={updating}
              >
                <ScaledText style={styles.modalButtonPrimaryText} baseSize={16}>
                  {updating ? 'Linking...' : 'Link Account'}
                </ScaledText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#2E7D32',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 12,
    minWidth: 40,
    textAlign: 'right',
  },
}); 