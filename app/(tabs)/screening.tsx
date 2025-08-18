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

export default function SteadiScreening() {
  const [answers, setAnswers] = useState({
    unsteady: null,
    worries: null,
    fallen: null,
    fallCount: '',
    fallInjured: '',
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
});
