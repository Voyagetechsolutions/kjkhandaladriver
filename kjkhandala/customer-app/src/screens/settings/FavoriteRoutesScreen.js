import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { THEME } from '../../config/theme';
import { Card, GradientHeader } from '../../components';

export default function FavoriteRoutesScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const user = auth?.user;
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorite_routes')
        .select(`
          *,
          routes (
            id,
            origin,
            destination,
            distance,
            estimated_duration
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorite routes');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (favorite) => {
    Alert.alert(
      'Remove Favorite',
      `Remove ${favorite.routes.origin} → ${favorite.routes.destination} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('favorite_routes')
                .delete()
                .eq('id', favorite.id);

              if (error) throw error;
              loadFavorites();
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  };

  const searchRoute = (favorite) => {
    navigation.navigate('Home', {
      origin: favorite.routes.origin,
      destination: favorite.routes.destination,
    });
  };

  const renderFavorite = ({ item }) => (
    <Card style={styles.favoriteCard}>
      <TouchableOpacity onPress={() => searchRoute(item)}>
        <View style={styles.routeInfo}>
          <View style={styles.routeHeader}>
            <Text style={styles.origin}>{item.routes.origin}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.destination}>{item.routes.destination}</Text>
          </View>

          {item.routes.distance && (
            <Text style={styles.distance}>
              Distance: {item.routes.distance} km
            </Text>
          )}

          {item.routes.estimated_duration && (
            <Text style={styles.duration}>
              Duration: ~{item.routes.estimated_duration}
            </Text>
          )}

          {item.nickname && (
            <Text style={styles.nickname}>"{item.nickname}"</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.searchBtn]}
            onPress={() => searchRoute(item)}
          >
            <Text style={styles.searchBtnText}>Search Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.removeBtn]}
            onPress={() => removeFavorite(item)}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Favorite Routes" />

      <View style={styles.content}>
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyText}>No favorite routes yet</Text>
              <Text style={styles.emptySubtext}>
                Save your frequently traveled routes for quick access
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.emptyButtonText}>Search Trips</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.gray[50],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME.colors.gray[600],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 16,
  },
  favoriteCard: {
    marginBottom: 12,
  },
  routeInfo: {
    marginBottom: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  origin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
  },
  arrow: {
    fontSize: 18,
    color: THEME.colors.primary,
    marginHorizontal: 8,
  },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
  },
  distance: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    marginBottom: 4,
  },
  nickname: {
    fontSize: 14,
    fontStyle: 'italic',
    color: THEME.colors.primary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchBtn: {
    backgroundColor: THEME.colors.primary,
  },
  searchBtnText: {
    color: THEME.colors.white,
    fontWeight: '600',
  },
  removeBtn: {
    backgroundColor: THEME.colors.gray[200],
  },
  removeBtnText: {
    color: THEME.colors.gray[700],
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
