/**
 * Exercise Log Screen
 * 
 * Allows users to log their weekly exercise minutes and view their exercise history.
 * Features:
 * - Weekly exercise minute tracking
 * - Exercise history with trends
 * - Weekly goals and progress visualization
 * - Data persisted to backend for analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import { api } from '../../lib/api';
import { useFocusEffect } from 'expo-router';
import { hapticFeedback } from '../../lib/haptics';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseLog {
  id: number;
  user_id: number;
  week_start: string;
  minutes: number;
  created_at: string;
}

export default function ExerciseLogScreen() {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentWeekMinutes, setCurrentWeekMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Get the start of the current week (Monday)
  const getCurrentWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday (0), go back 6 days
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const currentWeekStart = getCurrentWeekStart();

  const fetchExerciseLogs = async () => {
    setLoading(true);
    try {
      const response = await api.getCurrentWeekExercise(currentWeekStart);
      if (response.exercise_logs && response.exercise_logs.length > 0) {
        setCurrentWeekMinutes(response.exercise_logs[0].minutes.toString());
      }
      
      // Fetch all exercise logs for history
      const allLogsResponse = await api.getAllExerciseLogs();
      setExerciseLogs(allLogsResponse.exercise_logs || []);
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExerciseLogs();
    }, [])
  );

  const handleSubmitExercise = async () => {
    const minutes = parseInt(currentWeekMinutes);
    
    if (!currentWeekMinutes || isNaN(minutes) || minutes < 0) {
      hapticFeedback.error();
      Alert.alert('Invalid Input', 'Please enter a valid number of minutes (0 or greater).');
      return;
    }

    if (minutes > 10080) { // 7 days * 24 hours * 60 minutes
      hapticFeedback.error();
      Alert.alert('Invalid Input', 'Please enter a realistic number of minutes for one week.');
      return;
    }

    setSubmitLoading(true);
    try {
      hapticFeedback.success();
      await api.submitExercise({
        weekStart: currentWeekStart,
        minutes: minutes
      });
      
      Alert.alert('Success', 'Exercise minutes logged successfully!');
      fetchExerciseLogs(); // Refresh the data
    } catch (error) {
      hapticFeedback.error();
      console.error('Error submitting exercise:', error);
      Alert.alert('Error', 'Failed to log exercise minutes. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getWeekEndDate = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getExerciseLevel = (minutes: number) => {
    if (minutes >= 150) return { level: 'Excellent', color: '#4CAF50', icon: 'star' };
    if (minutes >= 100) return { level: 'Good', color: '#8BC34A', icon: 'thumbs-up' };
    if (minutes >= 50) return { level: 'Fair', color: '#FF9800', icon: 'warning' };
    return { level: 'Low', color: '#F44336', icon: 'alert-circle' };
  };

  const totalWeeks = exerciseLogs.length;
  const totalMinutes = exerciseLogs.reduce((sum, log) => sum + log.minutes, 0);
  const averageMinutes = totalWeeks > 0 ? Math.round(totalMinutes / totalWeeks) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Exercise Log</Text>
          <Text style={styles.subtitle}>Track your weekly exercise minutes</Text>
        </View>

        {/* Current Week Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>This Week</Text>
          </View>
          <Text style={styles.weekRange}>
            {formatDate(currentWeekStart)} - {getWeekEndDate(currentWeekStart)}
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter minutes exercised"
              value={currentWeekMinutes}
              onChangeText={setCurrentWeekMinutes}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputLabel}>minutes</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, submitLoading && styles.submitButtonDisabled]}
            onPress={handleSubmitExercise}
            disabled={submitLoading}
          >
            <Text style={styles.submitButtonText}>
              {submitLoading ? 'Saving...' : 'Log Exercise'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Guidelines */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.cardTitle}>Weekly Guidelines</Text>
          </View>
          <Text style={styles.guidelineText}>
            <Text style={styles.bold}>Recommended:</Text> 150+ minutes per week
          </Text>
          <Text style={styles.guidelineText}>
            <Text style={styles.bold}>Minimum:</Text> 50+ minutes per week
          </Text>
          <Text style={styles.guidelineNote}>
            Include balance exercises, strength training, and cardiovascular activities.
          </Text>
        </View>

        {/* Summary Stats */}
        {totalWeeks > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Your Progress</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalWeeks}</Text>
                <Text style={styles.statLabel}>Weeks Logged</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{averageMinutes}</Text>
                <Text style={styles.statLabel}>Avg Minutes/Week</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalMinutes}</Text>
                <Text style={styles.statLabel}>Total Minutes</Text>
              </View>
            </View>
          </View>
        )}

        {/* Exercise History */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={24} color="#9C27B0" />
            <Text style={styles.cardTitle}>Exercise History</Text>
          </View>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : exerciseLogs.length === 0 ? (
            <Text style={styles.emptyText}>No exercise logs yet. Start by logging this week!</Text>
          ) : (
            exerciseLogs.map((log) => {
              const exerciseLevel = getExerciseLevel(log.minutes);
              return (
                <View key={log.id} style={styles.historyItem}>
                  <View style={styles.historyDateContainer}>
                    <Text style={styles.historyDate}>
                      {formatDate(log.week_start)} - {getWeekEndDate(log.week_start)}
                    </Text>
                    <View style={[styles.levelBadge, { backgroundColor: exerciseLevel.color }]}>
                      <Ionicons name={exerciseLevel.icon as any} size={12} color="white" />
                      <Text style={styles.levelText}>{exerciseLevel.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyMinutes}>{log.minutes} minutes</Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  weekRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guidelineText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  guidelineNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDateContainer: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  historyMinutes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});