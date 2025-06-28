import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

interface Patient {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export default function CaretakerDashboardScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getPatients();
      setPatients(data.patients);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePatientPress = (patient: Patient) => {
    router.push({
      pathname: '/(tabs)/patient-details',
      params: { patientId: patient.id }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Caretaker Dashboard</Text>
      </View>
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Patients Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Patients ({patients.length})</Text>
            
            {patients.length === 0 ? (
              <View style={styles.card}>
                <Ionicons name="people-outline" size={48} color="#ccc" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No Patients Yet</Text>
                <Text style={styles.emptyText}>
                  Patients who use your referral code will appear here once they sign up.
                </Text>
              </View>
            ) : (
              patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.patientCard}
                  onPress={() => handlePatientPress(patient)}
                >
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.full_name}</Text>
                    <Text style={styles.patientEmail}>{patient.email}</Text>
                    <Text style={styles.patientDate}>
                      Joined: {formatDate(patient.created_at)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.card}>
              <View style={styles.actionItem}>
                <Ionicons name="qr-code-outline" size={24} color="#2E7D32" />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Your Referral Code</Text>
                  <Text style={styles.actionDescription}>
                    Share this code with patients to link them to your account
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.actionItem}>
                <Ionicons name="notifications-outline" size={24} color="#2E7D32" />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Recent Alerts</Text>
                  <Text style={styles.actionDescription}>
                    Important notifications and alerts will appear here
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  patientEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  patientDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 15,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 