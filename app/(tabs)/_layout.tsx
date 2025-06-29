import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="screening"
        options={{
          title: 'Screening',
          tabBarIcon: ({ color }) => <FontAwesome name="check-square-o" size={24} color={color} />,
          href: user.userType === 'patient' ? '/(tabs)/screening' : null,
        }}
      />
      <Tabs.Screen
        name="patient-info"
        options={{
          title: 'Patient Info',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
          href: user.userType === 'patient' ? '/(tabs)/patient-info' : null,
        }}
      />
      <Tabs.Screen
        name="fall-log"
        options={{
          title: 'Fall Log',
          tabBarIcon: ({ color }) => <FontAwesome name="history" size={24} color={color} />,
          href: user.userType === 'patient' ? '/(tabs)/fall-log' : null,
        }}
      />
      <Tabs.Screen
        name="caretaker-dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome name="dashboard" size={24} color={color} />,
          href: user.userType === 'caretaker' ? '/(tabs)/caretaker-dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="patient-details"
        options={{
          title: 'Patient Details',
          href: null, // Hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="tai-chi-map"
        options={{
          title: 'Tai-Chi Map',
          tabBarIcon: ({ color }) => <FontAwesome name="map-marker" size={24} color={color} />,
          href: user.userType === 'patient' ? '/(tabs)/tai-chi-map' : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
