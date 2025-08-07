import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

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
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const response = await api.getFavorites();
      setFavorites(response.favoriteIds || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (locationId: number) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to save favorites');
      return;
    }

    setLoading(true);
    try {
      const isFavorited = favorites.includes(locationId);
      
      if (isFavorited) {
        await api.removeFavorite(locationId);
        setFavorites(prev => prev.filter(id => id !== locationId));
      } else {
        await api.addFavorite(locationId);
        setFavorites(prev => [...prev, locationId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eventsToShow = showFavoritesOnly ? events.filter(event => favorites.includes(event.id)) : events;

  const CustomMarker = ({ event }: { event: typeof events[0] }) => {
    const isFavorited = favorites.includes(event.id);
    return (
      <Marker
        key={event.id}
        coordinate={event.coordinate}
        title={event.title}
        description={event.description}
      >
        <View style={[styles.customMarker, isFavorited && styles.favoriteMarker]}>
          <Ionicons 
            name={isFavorited ? "heart" : "location"} 
            size={24} 
            color={isFavorited ? "#FF6B6B" : "#2E7D32"} 
          />
        </View>
      </Marker>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Tai-Chi Events Near You</Text>
        
        {user && (
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.filterButton, showFavoritesOnly && styles.activeFilterButton]}
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Ionicons name="heart" size={16} color={showFavoritesOnly ? "#fff" : "#2E7D32"} />
              <Text style={[styles.filterButtonText, showFavoritesOnly && styles.activeFilterButtonText]}>
                Favorites Only ({favorites.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 41.6,
          longitude: -86.2,
          latitudeDelta: 0.8,
          longitudeDelta: 1.2,
        }}
      >
        {eventsToShow.map((event) => (
          <CustomMarker key={event.id} event={event} />
        ))}
      </MapView>

      {user && (
        <View style={styles.locationsList}>
          <Text style={styles.locationsTitle}>Locations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {eventsToShow.map((event) => (
              <View key={event.id} style={styles.locationCard}>
                <Text style={styles.locationCardTitle}>{event.title}</Text>
                <Text style={styles.locationCardDescription}>{event.description}</Text>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(event.id)}
                  disabled={loading}
                >
                  <Ionicons 
                    name={favorites.includes(event.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={favorites.includes(event.id) ? "#FF6B6B" : "#666"} 
                  />
                  <Text style={styles.favoriteButtonText}>
                    {favorites.includes(event.id) ? "Favorited" : "Add to Favorites"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#2E7D32',
  },
  controls: {
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#fff',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#2E7D32',
  },
  filterButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteMarker: {
    borderColor: '#FF6B6B',
  },
  locationsList: {
    backgroundColor: '#f8f9fa',
    paddingTop: 16,
    paddingBottom: 8,
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  locationScroll: {
    paddingHorizontal: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  locationCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favoriteButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});