import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { api } from '../../lib/api';

function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export default function SteadiScreening() {
  const [answers, setAnswers] = useState({
    unsteady: null,
    worries: null,
    fallen: null,
    fallCount: '',
    fallInjured: '',
  });
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [lastExercise, setLastExercise] = useState<number | null>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    fetchExercise();
  }, []);

  const fetchExercise = async () => {
    try {
      setExerciseLoading(true);
      const weekStart = getCurrentWeekStart();
      const response = await api.getCurrentWeekExercise(weekStart);
      if (response.exercise_logs && response.exercise_logs.length > 0) {
        setLastExercise(response.exercise_logs[0].minutes);
      }
    } catch (error) {
      // Silently fail if no exercise data exists yet
      console.log('No exercise data for current week');
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await api.submitScreening({
        unsteady: answers.unsteady === 'Yes',
        worries: answers.worries === 'Yes',
        fallen: answers.fallen === 'Yes',
        fallCount: answers.fallCount,
        fallInjured: answers.fallInjured,
      });
      alert('Answers submitted!');
    } catch (err: any) {
      alert('Failed to submit: ' + (err.message || 'Unknown error'));
    }
  };

  const handleExerciseSubmit = async () => {
    if (!exerciseMinutes || isNaN(Number(exerciseMinutes))) {
      Alert.alert('Error', 'Please enter the number of minutes exercised.');
      return;
    }
    try {
      setExerciseLoading(true);
      const weekStart = getCurrentWeekStart();
      const res = await api.submitExercise({ weekStart, minutes: Number(exerciseMinutes) });
      setLastExercise(res.exercise.minutes);
      Alert.alert('Success', 'Exercise log submitted!');
    } catch (err: any) {
      Alert.alert('Failed to submit: ' + (err.message || 'Unknown error'));
    } finally {
      setExerciseLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 24,
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.title}>Fall Risk Screening</Text>
        <Text style={styles.subtitle}>NIH STEADI-3 Questionnaire</Text>

        <Question
          text="1. Do you feel unsteady when standing or walking?"
          value={answers.unsteady}
          onChange={(val) => handleAnswer('unsteady', val)}
        />

        <Question
          text="2. Do you worry about falling?"
          value={answers.worries}
          onChange={(val) => handleAnswer('worries', val)}
        />

        <Question
          text="3. Have you fallen in the past year?"
          value={answers.fallen}
          onChange={(val) => handleAnswer('fallen', val)}
        />

        {answers.fallen === 'Yes' && (
          <View style={styles.extraSection}>
            <Text style={styles.extraLabel}>How many times?</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 2"
              value={answers.fallCount}
              onChangeText={(val) => handleAnswer('fallCount', val)}
            />

            <Text style={styles.extraLabel}>Were you injured?</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe injury"
              value={answers.fallInjured}
              onChangeText={(val) => handleAnswer('fallInjured', val)}
            />
          </View>
        )}

        <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Answers</Text>
        </Pressable>

        {/* Exercise Section */}
        <View style={styles.exerciseSection}>
          <Text style={styles.exerciseTitle}>Weekly Exercise</Text>
          <Text style={styles.exerciseLabel}>How many minutes of exercise did you do this week?</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 150"
            value={exerciseMinutes}
            onChangeText={setExerciseMinutes}
            editable={!exerciseLoading}
          />
          {lastExercise !== null && (
            <Text style={styles.exerciseInfo}>
              Last submitted for this week: <Text style={{ fontWeight: 'bold' }}>{lastExercise} minutes</Text>
            </Text>
          )}
          <Pressable
            style={[styles.button, styles.exerciseButton]}
            onPress={handleExerciseSubmit}
            disabled={exerciseLoading}
          >
            <Text style={styles.buttonText}>{exerciseLoading ? 'Submitting...' : 'Submit Exercise'}</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function Question({
  text,
  value,
  onChange,
}: {
  text: string;
  value: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionText}>{text}</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, value === 'Yes' && styles.selected]}
          onPress={() => onChange('Yes')}
        >
          <Text style={styles.buttonText}>Yes</Text>
        </Pressable>
        <Pressable
          style={[styles.button, value === 'No' && styles.selected]}
          onPress={() => onChange('No')}
        >
          <Text style={styles.buttonText}>No</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    color: '#2d3436',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#636e72',
    marginBottom: 20,
  },
  questionBlock: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2d3436',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#dfe6e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2bec3',
  },
  selected: {
    backgroundColor: '#74b9ff',
    borderColor: '#0984e3',
  },
  buttonText: {
    fontWeight: '600',
    color: '#2d3436',
  },
  extraSection: {
    marginTop: -8,
    marginBottom: 24,
  },
  extraLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 6,
    color: '#2d3436',
  },
  input: {
    borderColor: '#b2bec3',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 10,
  },
  exerciseSection: {
    marginTop: 36,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  exerciseLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseButton: {
    backgroundColor: '#2E7D32',
    marginTop: 8,
  },
});
