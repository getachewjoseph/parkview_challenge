import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PatientInfoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Patient Information</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Welcome to FallGuard! This screen will contain your personal information and health details.
            We'll add more features here soon.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#fff',
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
  infoContainer: {
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
}); 