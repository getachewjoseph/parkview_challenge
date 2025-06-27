import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const events = [
  {
    id: 1,
    title: 'Tai-Chi at South Bend Senior Center',
    description: 'Every Tuesday 10am-11am',
    coordinate: { latitude: 41.6764, longitude: -86.25199 },
  },
  {
    id: 2,
    title: 'Tai-Chi in Elkhart Park',
    description: 'Saturdays 9am-10am',
    coordinate: { latitude: 41.68199, longitude: -85.97667 },
  },
  {
    id: 3,
    title: 'Tai-Chi at Valparaiso YMCA',
    description: 'Thursdays 5pm-6pm',
    coordinate: { latitude: 41.4731, longitude: -87.0611 },
  },
];

export default function TaiChiMapScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Tai-Chi Events Near You</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 41.6,
          longitude: -86.2,
          latitudeDelta: 0.8,
          longitudeDelta: 1.2,
        }}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.coordinate}
            title={event.title}
            description={event.description}
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#2E7D32',
  },
  map: {
    flex: 1,
    width: '100%',
    height: Dimensions.get('window').height - 100,
  },
});
