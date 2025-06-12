import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';

export default function SteadiScreening() {
  const [answers, setAnswers] = useState({
    unsteady: null,
    worries: null,
    fallen: null,
    fallCount: '',
    fallInjured: '',
  });

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitted Answers:", answers);
    // TODO: Save answers to backend once user login is available
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>NIH STEADI-3 Basic Screening</Text>

      <Text style={styles.question}>1. Feels unsteady when standing or walking?</Text>
      <YesNoButtons value={answers.unsteady} onChange={val => handleAnswer('unsteady', val)} />

      <Text style={styles.question}>2. Worries about falling?</Text>
      <YesNoButtons value={answers.worries} onChange={val => handleAnswer('worries', val)} />

      <Text style={styles.question}>3. Has fallen in the past year?</Text>
      <YesNoButtons value={answers.fallen} onChange={val => handleAnswer('fallen', val)} />

      {answers.fallen === 'Yes' && (
        <>
          <Text style={styles.followup}>How many times?</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={answers.fallCount}
            onChangeText={(val) => handleAnswer('fallCount', val)}
          />
          <Text style={styles.followup}>Were you injured?</Text>
          <TextInput
            style={styles.input}
            value={answers.fallInjured}
            onChangeText={(val) => handleAnswer('fallInjured', val)}
          />
        </>
      )}

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </Pressable>
    </ScrollView>
  );
}

const YesNoButtons = ({ value, onChange }) => (
  <View style={styles.buttonRow}>
    <Pressable
      style={[styles.button, value === 'Yes' && styles.selected]}
      onPress={() => onChange('Yes')}
    >
      <Text>Yes</Text>
    </Pressable>
    <Pressable
      style={[styles.button, value === 'No' && styles.selected]}
      onPress={() => onChange('No')}
    >
      <Text>No</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    marginTop: 15,
  },
  followup: {
    fontSize: 14,
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#eee',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  selected: {
    backgroundColor: '#b0e0e6',
  },
  submitButton: {
    backgroundColor: '#4682b4',
    marginTop: 30,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
