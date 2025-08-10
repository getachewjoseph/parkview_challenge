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
import { hapticFeedback } from '../../lib/haptics';
import { ScaledText } from '../../components/ScaledText';

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
      hapticFeedback.formSubmit();
      await api.submitScreening({
        unsteady: answers.unsteady === 'Yes',
        worries: answers.worries === 'Yes',
        fallen: answers.fallen === 'Yes',
        fallCount: answers.fallCount,
        fallInjured: answers.fallInjured,
      });
      hapticFeedback.success();
      alert('Answers submitted!');
    } catch (err: any) {
      hapticFeedback.error();
      alert('Failed to submit: ' + (err.message || 'Unknown error'));
    }
  };

  const handleExerciseSubmit = async () => {
    if (!exerciseMinutes || isNaN(Number(exerciseMinutes))) {
      hapticFeedback.error();
      Alert.alert('Error', 'Please enter the number of minutes exercised.');
      return;
    }
    try {
      setExerciseLoading(true);
      hapticFeedback.formSubmit();
      const weekStart = getCurrentWeekStart();
      const res = await api.submitExercise({ weekStart, minutes: Number(exerciseMinutes) });
      setLastExercise(res.exercise.minutes);
      hapticFeedback.success();
      Alert.alert('Success', 'Exercise log submitted!');
    } catch (err: any) {
      hapticFeedback.error();
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
        <ScaledText style={styles.title} baseSize={28}>Fall Risk Screening</ScaledText>
        <ScaledText style={styles.subtitle} baseSize={16}>NIH STEADI-3 Questionnaire</ScaledText>

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
            <ScaledText style={styles.extraLabel} baseSize={16}>How many times?</ScaledText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 2"
              value={answers.fallCount}
              onChangeText={(val) => handleAnswer('fallCount', val)}
            />

            <ScaledText style={styles.extraLabel} baseSize={16}>Were you injured?</ScaledText>
            <TextInput
              style={styles.input}
              placeholder="Describe injury"
              value={answers.fallInjured}
              onChangeText={(val) => handleAnswer('fallInjured', val)}
            />
          </View>
        )}

        <Pressable 
          style={[styles.button, styles.submitButton]} 
          onPress={() => {
            hapticFeedback.buttonPress();
            handleSubmit();
          }}
        >
          <ScaledText style={styles.buttonText} baseSize={16}>Submit Answers</ScaledText>
        </Pressable>

        {/* Exercise Section */}
        <View style={styles.exerciseSection}>
          <ScaledText style={styles.exerciseTitle} baseSize={20}>Weekly Exercise</ScaledText>
          <ScaledText style={styles.exerciseLabel} baseSize={16}>How many minutes of exercise did you do this week?</ScaledText>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 150"
            value={exerciseMinutes}
            onChangeText={setExerciseMinutes}
            editable={!exerciseLoading}
          />
          {lastExercise !== null && (
            <ScaledText style={styles.exerciseInfo} baseSize={14}>
              Last submitted for this week: <ScaledText style={{ fontWeight: 'bold' }} baseSize={14}>{lastExercise} minutes</ScaledText>
            </ScaledText>
          )}
          <Pressable
            style={[styles.button, styles.exerciseButton]}
            onPress={() => {
              hapticFeedback.buttonPress();
              handleExerciseSubmit();
            }}
            disabled={exerciseLoading}
          >
            <ScaledText style={styles.buttonText} baseSize={16}>{exerciseLoading ? 'Submitting...' : 'Submit Exercise'}</ScaledText>
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
      <ScaledText style={styles.questionText} baseSize={16}>{text}</ScaledText>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, value === 'Yes' && styles.selected]}
          onPress={() => {
            hapticFeedback.toggle();
            onChange('Yes');
          }}
        >
          <ScaledText style={styles.buttonText} baseSize={16}>Yes</ScaledText>
        </Pressable>
        <Pressable
          style={[styles.button, value === 'No' && styles.selected]}
          onPress={() => {
            hapticFeedback.toggle();
            onChange('No');
          }}
        >
          <ScaledText style={styles.buttonText} baseSize={16}>No</ScaledText>
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
