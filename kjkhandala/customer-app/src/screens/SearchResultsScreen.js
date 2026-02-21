import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { THEME } from '../config/theme';
import { Card, Badge } from '../components';
import { format } from 'date-fns';

export default function SearchResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { origin, destination, date, returnDate, passengers, tripType } = route.params;
  
  const [trips, setTrips] = useState([]);
  const [returnTrips, setReturnTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedReturnTrip, setSelectedReturnTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showingReturnTrips, setShowingReturnTrips] = useState(false);

  useEffect(() => {
    searchTrips();
    if (tripType === 'return' && returnDate) {
      searchReturnTrips();
    }
  }, []);

  const searchTrips = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          trip_number,
          scheduled_departure,
          scheduled_arrival,
          fare,
          status,
          total_seats,
          available_seats,
          routes!inner(origin, destination),
          buses(name, bus_type)
        `)
        .eq('routes.origin', origin)
        .eq('routes.destination', destination)
        .gte('scheduled_departure', `${date}T00:00:00`)
        .lte('scheduled_departure', `${date}T23:59:59`)
        .in('status', ['SCHEDULED', 'BOARDING'])
        .gte('available_seats', passengers)
        .order('scheduled_departure');

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchReturnTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          trip_number,
          scheduled_departure,
          scheduled_arrival,
          fare,
          status,
          total_seats,
          available_seats,
          routes!inner(origin, destination),
          buses(name, bus_type)
        `)
        .eq('routes.origin', destination)
        .eq('routes.destination', origin)
        .gte('scheduled_departure', `${returnDate}T00:00:00`)
        .lte('scheduled_departure', `${returnDate}T23:59:59`)
        .in('status', ['SCHEDULED', 'BOARDING'])
        .gte('available_seats', passengers)
        .order('scheduled_departure');

      if (error) throw error;
      setReturnTrips(data || []);
    } catch (error) {
      console.error('Error searching return trips:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    searchTrips();
    if (tripType === 'return' && returnDate) {
      searchReturnTrips();
    }
  };

  const selectTrip = (trip, isReturnTrip = false) => {
    if (isReturnTrip) {
      setSelectedReturnTrip(trip);
      // If both trips selected, proceed to seat selection
      if (selectedTrip) {
        navigation.navigate('SeatSelection', {
          trip: selectedTrip,
          returnTrip: trip,
          passengers,
          origin,
          destination,
          date,
          returnDate,
        });
      }
    } else {
      setSelectedTrip(trip);
      // If one-way or both trips selected, proceed
      if (tripType === 'one-way') {
        navigation.navigate('SeatSelection', {
          trip,
          passengers,
          origin,
          destination,
          date,
        });
      } else if (selectedReturnTrip) {
        navigation.navigate('SeatSelection', {
          trip,
          returnTrip: selectedReturnTrip,
          passengers,
          origin,
          destination,
          date,
          returnDate,
        });
      } else {
        // Show return trips
        setShowingReturnTrips(true);
      }
    }
  };

  const calculateDuration = (departure, arrival) => {
    if (!arrival) return 'TBA';
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Searching for trips...</Text>
      </View>
    );
  }

  const currentTrips = showingReturnTrips ? returnTrips : trips;
  const hasReturnTrip = tripType === 'return';

  return (
    <View style={styles.container}>
      {/* Trip Type Toggle for Return Trips */}
      {hasReturnTrip && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !showingReturnTrips && styles.toggleBtnActive,
            ]}
            onPress={() => setShowingReturnTrips(false)}
          >
            <Text
              style={[
                styles.toggleText,
                !showingReturnTrips && styles.toggleTextActive,
              ]}
            >
              Outbound
              {selectedTrip && ' ✓'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              showingReturnTrips && styles.toggleBtnActive,
            ]}
            onPress={() => setShowingReturnTrips(true)}
          >
            <Text
              style={[
                styles.toggleText,
                showingReturnTrips && styles.toggleTextActive,
              ]}
            >
              Return
              {selectedReturnTrip && ' ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={currentTrips}
        renderItem={({ item }) => {
          const isSelected = showingReturnTrips
            ? selectedReturnTrip?.id === item.id
            : selectedTrip?.id === item.id;
          
          return (
            <TouchableOpacity
              style={[
                styles.tripCard,
                isSelected && styles.tripCardSelected,
              ]}
              onPress={() => selectTrip(item, showingReturnTrips)}
            >
            <View style={styles.tripHeader}>
              <View style={styles.busInfo}>
                <Text style={styles.busType}>{item.bus?.bus_type || 'Standard'}</Text>
                <Text style={styles.busReg}>{item.bus?.name}</Text>
              </View>
              <Badge status={item.status?.toLowerCase()}>
                {item.status}
              </Badge>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeBlock}>
                <Text style={styles.time}>{format(new Date(item.scheduled_departure), 'hh:mm a')}</Text>
                <Text style={styles.location}>{item.routes?.origin || item.route?.origin}</Text>
              </View>
              <View style={styles.durationContainer}>
                <View style={styles.durationLine} />
                <Text style={styles.duration}>{calculateDuration(item.scheduled_departure, item.scheduled_arrival)}</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.time}>{item.scheduled_arrival ? format(new Date(item.scheduled_arrival), 'hh:mm a') : 'TBA'}</Text>
                <Text style={styles.location}>{item.routes?.destination || item.route?.destination}</Text>
              </View>
            </View>

            <View style={styles.tripFooter}>
              <View style={styles.seatsInfo}>
                <Text style={styles.seatsText}>{item.available_seats} seat{item.available_seats !== 1 ? 's' : ''} left</Text>
                {item.available_seats <= 5 && (
                  <Text style={styles.urgencyBadge}>Filling Fast!</Text>
                )}
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>BWP {item.fare}</Text>
                <Text style={styles.priceLabel}>per seat</Text>
              </View>
            </View>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🚌</Text>
            <Text style={styles.emptyTitle}>No trips found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or selecting a different date
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME.colors.gray[600],
  },
  tripCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    ...THEME.shadows.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  busInfo: {
    flex: 1,
  },
  busType: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.dark,
  },
  busReg: {
    fontSize: 12,
    color: THEME.colors.gray[500],
    marginTop: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBlock: {
    flex: 1,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
  },
  location: {
    fontSize: 12,
    color: THEME.colors.gray[600],
    marginTop: 2,
  },
  durationContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  durationLine: {
    width: 60,
    height: 2,
    backgroundColor: THEME.colors.gray[300],
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: THEME.colors.gray[600],
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.gray[200],
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: 14,
    color: THEME.colors.gray[600],
  },
  urgencyBadge: {
    fontSize: 11,
    color: THEME.colors.danger,
    fontWeight: 'bold',
    marginLeft: 8,
    backgroundColor: THEME.colors.danger + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: THEME.colors.gray[500],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: THEME.colors.gray[600],
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.gray[200],
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: THEME.colors.gray[100],
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.gray[600],
  },
  toggleTextActive: {
    color: THEME.colors.white,
  },
  tripCardSelected: {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
