import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { api } from '../../lib/api';
import { useFocusEffect } from 'expo-router';

interface Fall {
  id: number;
  fall_date: string;
  location: string;
  activity: string;
  cause?: string;
  injuries?: string;
}

export default function FallLogScreen() {
  const [falls, setFalls] = useState<Fall[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFall, setNewFall] = useState({
    fall_date: new Date(),
    location: '',
    activity: '',
    cause: '',
    injuries: '',
  });

  const fetchFalls = async () => {
    try {
      const data = await api.getFallLog();
      setFalls(data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch fall log.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFalls();
    }, [])
  );

  const handleLogFall = async () => {
    if (!newFall.location || !newFall.activity) {
      Alert.alert('Error', 'Please fill in at least the location and activity.');
      return;
    }
    try {
      await api.logFall(newFall);
      setModalVisible(false);
      fetchFalls(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Could not log fall.');
    }
  };

  const renderItem = ({ item }: { item: Fall }) => (
    <View style={styles.fallItem}>
      <Text style={styles.fallDate}>{new Date(item.fall_date).toLocaleDateString()}</Text>
      <Text>Location: {item.location}</Text>
      <Text>Activity: {item.activity}</Text>
      {item.cause && <Text>Cause: {item.cause}</Text>}
      {item.injuries && <Text>Injuries: {item.injuries}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Fall Log</Text>
        <FlatList
          data={falls}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>No falls logged yet.</Text>}
        />
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Log New Fall</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Log a New Fall</Text>
            <TextInput
              style={styles.input}
              placeholder="Location of fall"
              value={newFall.location}
              onChangeText={(text) => setNewFall({ ...newFall, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Activity during fall"
              value={newFall.activity}
              onChangeText={(text) => setNewFall({ ...newFall, activity: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Cause of fall (optional)"
              value={newFall.cause}
              onChangeText={(text) => setNewFall({ ...newFall, cause: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Injuries sustained (optional)"
              value={newFall.injuries}
              onChangeText={(text) => setNewFall({ ...newFall, injuries: text })}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogFall}>
              <Text style={styles.buttonText}>Save Fall</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  fallItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  fallDate: { fontWeight: 'bold' },
  button: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  modalTitle: { fontSize: 20, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, width: '100%', marginBottom: 15 },
  cancelButton: { backgroundColor: '#d9534f' },
}); 