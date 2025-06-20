import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { user, logout, checkAuth } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [patientReferralCode, setPatientReferralCode] = useState('');
  const [loading, setLoading] = useState(user?.userType === 'caretaker');
  const [updating, setUpdating] = useState(false);

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

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const data = await api.updateReferralCode(newReferralCode);
      setReferralCode(data.referralCode);
      setNewReferralCode(data.referralCode);
      Alert.alert('Success', 'Referral code updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update referral code');
    } finally {
      setUpdating(false);
    }
  };

  const handleLinkCaretaker = async () => {
    if (!patientReferralCode) {
      Alert.alert('Error', 'Please enter a referral code.');
      return;
    }
    try {
      setUpdating(true);
      await api.linkCaretaker(patientReferralCode);
      await checkAuth(); // Re-fetch user data to update context
      Alert.alert('Success', 'You have been successfully linked to your caretaker.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to link caretaker.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading && user?.userType === 'caretaker') {
    return <ActivityIndicator style={styles.centered} size="large" color="#2E7D32" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {user?.userType === 'caretaker' ? (
          <>
            <Text style={styles.title}>Your Referral Code</Text>
            <Text style={styles.code}>{referralCode}</Text>

            <Text style={styles.label}>Update Your Code</Text>
            <TextInput
              style={styles.input}
              value={newReferralCode}
              onChangeText={setNewReferralCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={updating}>
              <Text style={styles.buttonText}>{updating ? 'Updating...' : 'Update Code'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your account details.</Text>

            {user && !user.caretakerId && (
              <View style={styles.linkContainer}>
                <Text style={styles.label}>Link to a Caretaker</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Caretaker's Referral Code"
                  value={patientReferralCode}
                  onChangeText={setPatientReferralCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.button} onPress={handleLinkCaretaker} disabled={updating}>
                  <Text style={styles.buttonText}>{updating ? 'Linking...' : 'Link Account'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.separator} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  code: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 4,
    color: '#2E7D32',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 30,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  linkContainer: {
    marginTop: 20,
  },
}); 