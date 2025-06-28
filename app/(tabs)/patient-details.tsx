import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

interface Patient {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

interface Screening {
  id: number;
  unsteady: boolean;
  worries: boolean;
  fallen: boolean;
  fall_count: number | null;
  fall_injured: string | null;
  created_at: string;
}

interface Fall {
  id: number;
  fall_date: string;
  location: string | null;
  activity: string | null;
  cause: string | null;
  injuries: string | null;
  created_at: string;
}

export default function PatientDetailsScreen() {
  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [falls, setFalls] = useState<Fall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientDetails();
  }, [patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getPatientDetails(Number(patientId));
      setPatient(data.patient);
      setScreenings(data.screenings);
      setFalls(data.falls);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load patient details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskLevel = (screening: Screening) => {
    const riskFactors = [
      screening.unsteady,
      screening.worries,
      screening.fallen,
      (screening.fall_count || 0) > 0
    ].filter(Boolean).length;

    if (riskFactors >= 3) return { level: 'High', color: '#d32f2f' };
    if (riskFactors >= 2) return { level: 'Medium', color: '#f57c00' };
    return { level: 'Low', color: '#388e3c' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading patient details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Patient not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
      </View>
      
      <ScrollView style={styles.container}>
        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.card}>
            <Text style={styles.patientName}>{patient.full_name}</Text>
            <Text style={styles.patientEmail}>{patient.email}</Text>
            <Text style={styles.patientDate}>Joined: {formatDate(patient.created_at)}</Text>
          </View>
        </View>

        {/* Risk Screenings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Screenings ({screenings.length})</Text>
          {screenings.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No screenings completed yet</Text>
            </View>
          ) : (
            screenings.map((screening, index) => {
              const riskLevel = getRiskLevel(screening);
              return (
                <View key={screening.id} style={styles.card}>
                  <View style={styles.screeningHeader}>
                    <Text style={styles.screeningDate}>
                      {formatDate(screening.created_at)}
                    </Text>
                    <View style={[styles.riskBadge, { backgroundColor: riskLevel.color }]}>
                      <Text style={styles.riskText}>{riskLevel.level} Risk</Text>
                    </View>
                  </View>
                  
                  <View style={styles.screeningDetails}>
                    <Text style={styles.detailText}>
                      • Feels unsteady: {screening.unsteady ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.detailText}>
                      • Worries about falling: {screening.worries ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.detailText}>
                      • Has fallen: {screening.fallen ? 'Yes' : 'No'}
                    </Text>
                    {screening.fall_count !== null && (
                      <Text style={styles.detailText}>
                        • Number of falls: {screening.fall_count}
                      </Text>
                    )}
                    {screening.fall_injured && (
                      <Text style={styles.detailText}>
                        • Injuries: {screening.fall_injured}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Fall Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fall Log ({falls.length})</Text>
          {falls.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No falls recorded</Text>
            </View>
          ) : (
            falls.map((fall) => (
              <View key={fall.id} style={styles.card}>
                <Text style={styles.fallDate}>{formatDate(fall.fall_date)}</Text>
                
                {fall.location && (
                  <Text style={styles.detailText}>Location: {fall.location}</Text>
                )}
                {fall.activity && (
                  <Text style={styles.detailText}>Activity: {fall.activity}</Text>
                )}
                {fall.cause && (
                  <Text style={styles.detailText}>Cause: {fall.cause}</Text>
                )}
                {fall.injuries && (
                  <Text style={styles.detailText}>Injuries: {fall.injuries}</Text>
                )}
              </View>
            ))
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2E7D32',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
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
    padding: 15,
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
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  patientEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  patientDate: {
    fontSize: 14,
    color: '#999',
  },
  screeningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  screeningDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  screeningDetails: {
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  fallDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 